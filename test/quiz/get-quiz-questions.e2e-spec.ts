import { beforeAll, expect } from '@jest/globals';
import { HttpStatus, INestApplication } from '@nestjs/common';
import _ from 'lodash';
import request from 'supertest';

import { BaseAuthPayload } from '../../src/constants';
import { init } from '../utils/init.test';

jest.setTimeout(120000);

describe('Quiz questions get request (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await init();
  });

  afterAll(async () => {
    await app.close();
  });

  type Question = {
    id: string;
    body: string;
    correctAnswers: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
  };

  let questions: Question[] = [];
  let total = questions.length;

  enum PublishQuizQuestionEnum {
    ALL = 'all',
    PUBLISHED = 'published',
    NOT_PUBLISHED = 'notPublished',
  }

  beforeAll(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
    questions = [];

    const arr = new Array(11).fill(undefined).map((_v, index) => {
      const bodyPayload = {
        body: `body for question ${index}`,
        correctAnswers: [`first answer ${index}`, `second answer ${index}`],
      };

      return bodyPayload;
    });

    for await (const questionBody of arr) {
      const result = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send(questionBody)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      questions.push(result);
    }

    questions = _.orderBy(questions, 'createdAt', 'desc');
    total = questions.length;
  });

  describe('should return questions array with pagination', () => {
    it('should return pageSize=5, pageNumber=1, totalCount=10 and correct sort', async () => {
      const pageSize = 5;
      const pageNumber = 1;
      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(`/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.page).toBe(pageNumber);
      expect(quizQuestionsResponse.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse.items).toHaveLength(pageSize);
      expect(quizQuestionsResponse.totalCount).toBe(total);
      expect(quizQuestionsResponse.pagesCount).toBe(
        Math.ceil(total / pageSize),
      );
      const expectedArray = [
        questions.at(0),
        questions.at(1),
        questions.at(2),
        questions.at(3),
        questions.at(4),
      ];
      expect(quizQuestionsResponse.items).toStrictEqual(expectedArray);
    });

    it('should return pageSize=3, pageNumber=3, totalCount=10 and correct sort', async () => {
      const pageSize = 3;
      const pageNumber = 3;
      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(`/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.page).toBe(pageNumber);
      expect(quizQuestionsResponse.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse.items).toHaveLength(pageSize);
      expect(quizQuestionsResponse.totalCount).toBe(total);
      expect(quizQuestionsResponse.pagesCount).toBe(
        Math.ceil(total / pageSize),
      );
      const expectedArray = [questions.at(6), questions.at(7), questions.at(8)];
      expect(quizQuestionsResponse.items).toStrictEqual(expectedArray);
    });

    it('should return pageSize=3, pageNumber=1, totalCount=2', async () => {
      const pageSize = 3;
      const pageNumber = 1;
      const bodySearchTerm = '1';
      const total = 2;
      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(
          `/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}&bodySearchTerm=${bodySearchTerm}`,
        )
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.page).toBe(pageNumber);
      expect(quizQuestionsResponse.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse.items).toHaveLength(total);
      expect(quizQuestionsResponse.totalCount).toBe(total);
      expect(quizQuestionsResponse.pagesCount).toBe(
        Math.ceil(total / pageSize),
      );
      const expectedArray = [questions.at(1 - 1), questions.at(-1 - 1)];
      expect(quizQuestionsResponse.items).toStrictEqual(expectedArray);
    });

    it('should return pageSize=3, pageNumber=1, totalCount=0 with publishStatus "PUBLISHED"', async () => {
      const pageSize = 3;
      const pageNumber = 1;
      const total = 0;

      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(
          `/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}&publishedStatus=${PublishQuizQuestionEnum.PUBLISHED}`,
        )
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.page).toBe(pageNumber);
      expect(quizQuestionsResponse.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse.items).toHaveLength(total);
      expect(quizQuestionsResponse.totalCount).toBe(total);
      expect(quizQuestionsResponse.pagesCount).toBe(
        Math.ceil(total / pageSize),
      );
    });

    it('should return pageSize=10, pageNumber=1, totalCount=3 with all publishStatuses', async () => {
      const questionsForPublished = [...questions].slice(0, 3);
      await Promise.all(
        questionsForPublished.map(async ({ id: questionId }) => {
          await request(app.getHttpServer())
            .put(`/sa/quiz/questions/${questionId}/publish`)
            .auth(BaseAuthPayload.login, BaseAuthPayload.password)
            .send({
              published: true,
            })
            .expect(HttpStatus.NO_CONTENT)
            .then((response) => response.body);
        }),
      );

      const pageSize = 10;
      const pageNumber = 1;
      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(
          `/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}&publishedStatus=${PublishQuizQuestionEnum.PUBLISHED}`,
        )
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.page).toBe(pageNumber);
      expect(quizQuestionsResponse.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse.items).toHaveLength(
        questionsForPublished.length,
      );
      expect(quizQuestionsResponse.totalCount).toBe(
        questionsForPublished.length,
      );
      expect(quizQuestionsResponse.pagesCount).toBe(Math.ceil(3 / pageSize));
      expect(
        quizQuestionsResponse.items.map(({ published }) => published),
      ).toStrictEqual(new Array(3).fill(true));

      const quizQuestionsResponse2 = await request(app.getHttpServer())
        .get(
          `/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}&publishedStatus=${PublishQuizQuestionEnum.NOT_PUBLISHED}`,
        )
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      const lengthWithNotPublishdQuestions = 11 - 3;

      expect(quizQuestionsResponse2.page).toBe(pageNumber);
      expect(quizQuestionsResponse2.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse2.items).toHaveLength(
        lengthWithNotPublishdQuestions,
      );
      expect(quizQuestionsResponse2.totalCount).toBe(
        lengthWithNotPublishdQuestions,
      );
      expect(quizQuestionsResponse2.pagesCount).toBe(
        Math.ceil(lengthWithNotPublishdQuestions / pageSize),
      );
      expect(
        quizQuestionsResponse2.items.map(({ published }) => published),
      ).toStrictEqual(new Array(lengthWithNotPublishdQuestions).fill(false));

      const quizQuestionsResponse3 = await request(app.getHttpServer())
        .get(
          `/sa/quiz/questions?pageSize=${pageSize}&pageNumber=${pageNumber}&publishedStatus=${PublishQuizQuestionEnum.ALL}`,
        )
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      const lengthWithAllQuestions = 11;

      expect(quizQuestionsResponse3.page).toBe(pageNumber);
      expect(quizQuestionsResponse3.pageSize).toBe(pageSize);
      expect(quizQuestionsResponse3.items).toHaveLength(pageSize);
      expect(quizQuestionsResponse3.totalCount).toBe(lengthWithAllQuestions);
      expect(quizQuestionsResponse3.pagesCount).toBe(
        Math.ceil(lengthWithAllQuestions / pageSize),
      );
      expect(
        quizQuestionsResponse3.items.map(({ published }) => published),
      ).toStrictEqual(
        [new Array(3).fill(true), new Array(7).fill(false)].flat(),
      );
    });
  });
});
