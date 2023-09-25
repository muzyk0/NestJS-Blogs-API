import { randomUUID } from 'crypto';

import _ from 'lodash';

import { beforeAll, beforeEach, expect } from '@jest/globals';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { BaseAuthPayload } from '../../src/constants';
import { init } from '../utils/init.test';
import { wait } from '../utils/utils';

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

  beforeAll(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
    questions = [];

    const arr = new Array(10).fill(undefined).map((_v, index) => {
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
  });
});
