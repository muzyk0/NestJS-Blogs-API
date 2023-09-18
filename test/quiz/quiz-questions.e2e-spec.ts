import { randomUUID } from 'crypto';

import { expect } from '@jest/globals';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { BaseAuthPayload } from '../../src/constants';
import { init } from '../utils/init.test';

jest.setTimeout(120000);

describe('Quiz questions controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  describe('should quiz questions endpoints throw error with status codes', () => {
    it('should get quiz questions failed with unauthorized code', async () => {
      await request(app.getHttpServer())
        .get(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, `${BaseAuthPayload.password}-invalid`)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => response.body);
    });

    it('should create quiz question failed with unauthorized code and bad request', async () => {
      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, `${BaseAuthPayload.password}-invalid`)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: {
            name: 'Quiz Question in object',
            content: 'Lorem ipsum dolor sit amet',
          },
          correctAnswers: ['object'],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'short',
          correctAnswers: ['short'],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'without correct answers',
          correctAnswers: [],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'very long question - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Cras semper auctor neque vitae tempus. Id donec ultrices tincidunt arcu non sodales neque. Natoque penatibus et magnis dis. Diam sit amet nisl suscipit adipiscing bibendum est ultricies. Ultricies mi quis hendrerit dolor magna. Semper eget duis at tellus at urna condimentum mattis pellentesque. Felis eget velit aliquet sagittis id consectetur. Dictum varius duis at consectetur. Tellus mauris a diam maecenas. Gravida neque convallis a cras. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper. Aliquam ultrices sagittis orci a scelerisque purus. Vulputate enim nulla aliquet porttitor. Sed faucibus turpis in eu mi bibendum neque. In hac habitasse platea dictumst.',
          correctAnswers: ['long'],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);
    });

    it('should delete quiz question failed with unauthorized code and not found', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, `${BaseAuthPayload.password}-invalid`)
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.NOT_FOUND)
        .then((response) => response.body);
    });

    it('should update quiz question failed with unauthorized code, bad request and not found', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, `${BaseAuthPayload.password}-invalid`)
        .send({
          body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'How?',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions${randomUUID()}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.NOT_FOUND)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);
    });

    it('should public quiz question failed with unauthorized code, bad request and not found', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}/publish`)
        .auth(BaseAuthPayload.login, `${BaseAuthPayload.password}-invalid`)
        .send({
          published: true,
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'incorrect payload',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions${randomUUID()}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          published: true,
        })
        .expect(HttpStatus.NOT_FOUND)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          published: false,
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          published: true,
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
          correctAnswers: ['2', 'two'],
        })
        .expect(HttpStatus.NOT_FOUND)
        .then((response) => response.body);
    });
  });

  describe('should quiz questions endpoints work correctly', () => {
    it('should create quiz question', async () => {
      const payload = {
        body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
        correctAnswers: ['2', 'two'],
      };
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send(payload)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      expect(quizQuestion).toStrictEqual({
        id: expect.any(String),
        body: quizQuestion.body,
        correctAnswers: quizQuestion.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      });
    });

    it('should get quiz questions', async () => {
      const payload = {
        body: 'What is it endpoint do?',
        correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
      };
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send(payload)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.totalCount).toBe(1);
      expect(quizQuestionsResponse.items).toHaveLength(1);
      expect(quizQuestionsResponse.items[0]).toStrictEqual({
        id: expect.any(String),
        body: quizQuestion.body,
        correctAnswers: quizQuestion.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      });

      const payload2 = {
        body: 'What is know "DTO"?',
        correctAnswers: ['data transfer object'],
      };
      const quizQuestion2 = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send(payload2)
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion2.id}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          published: true,
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      const quizQuestionsResponse2 = await request(app.getHttpServer())
        .get(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse2.totalCount).toBe(2);
      expect(quizQuestionsResponse2.items).toHaveLength(2);
      expect(quizQuestionsResponse2.items).toStrictEqual([
        {
          id: expect.any(String),
          body: quizQuestion2.body,
          correctAnswers: quizQuestion2.correctAnswers,
          published: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        {
          id: expect.any(String),
          body: quizQuestion.body,
          correctAnswers: quizQuestion.correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        },
      ]);
    });

    it('should delete quiz question', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      await request(app.getHttpServer())
        .delete(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);
    });

    it('should update quiz question', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      expect(quizQuestion.id).toBeDefined();

      const updatePayload = {
        body: 'How many apples do you have left if your girlfriend took an apple out of her backpack and there were three',
        correctAnswers: ['2'],
      };
      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send(updatePayload)
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.totalCount).toBe(1);
      expect(quizQuestionsResponse.items).toHaveLength(1);
      expect(quizQuestionsResponse.items[0]).toStrictEqual({
        id: expect.any(String),
        body: updatePayload.body,
        correctAnswers: updatePayload.correctAnswers,
        published: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should public quiz question', async () => {
      const quizQuestion = await request(app.getHttpServer())
        .post(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          body: 'What is it endpoint do?',
          correctAnswers: ['quiz', 'quiz-question', 'quiz-questions'],
        })
        .expect(HttpStatus.CREATED)
        .then((response) => response.body);

      await request(app.getHttpServer())
        .put(`/sa/quiz/questions/${quizQuestion.id}/publish`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .send({
          published: true,
        })
        .expect(HttpStatus.NO_CONTENT)
        .then((response) => response.body);

      const quizQuestionsResponse = await request(app.getHttpServer())
        .get(`/sa/quiz/questions`)
        .auth(BaseAuthPayload.login, BaseAuthPayload.password)
        .expect(HttpStatus.OK)
        .then((response) => response.body);

      expect(quizQuestionsResponse.totalCount).toBe(1);
      expect(quizQuestionsResponse.items).toHaveLength(1);
      expect(quizQuestionsResponse.items[0]).toStrictEqual({
        id: quizQuestion.id,
        body: quizQuestion.body,
        correctAnswers: quizQuestion.correctAnswers,
        published: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
