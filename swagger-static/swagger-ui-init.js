
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/blog-platform": {
        "get": {
          "operationId": "AppController_getHello",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/blog-platform/blogs": {
        "get": {
          "operationId": "BlogsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success"
            }
          },
          "tags": [
            "blogs"
          ]
        }
      },
      "/blog-platform/blogs/{id}": {
        "get": {
          "operationId": "BlogsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "blogs"
          ]
        }
      },
      "/blog-platform/blogs/{id}/posts": {
        "get": {
          "operationId": "BlogsController_findBlogPosts",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success"
            },
            "404": {
              "description": "If specificied blog is not exists"
            }
          },
          "tags": [
            "blogs"
          ]
        }
      },
      "/blog-platform/blogger/blogs": {
        "post": {
          "operationId": "BloggerController_create",
          "summary": "Create new blog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogInput"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns the newly created blog"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "BloggerController_findAll",
          "summary": "Returns blogs (for which current user is owner) with paging",
          "parameters": [],
          "responses": {
            "200": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blog-platform/blogger/blogs/{id}": {
        "put": {
          "operationId": "BloggerController_update",
          "summary": "Update existing Blog by id with InputModel",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update blog that doesn't belong to current user"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "BloggerController_remove",
          "summary": "Delete blog specified by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blog-platform/blogger/blogs/{id}/posts": {
        "post": {
          "operationId": "BloggerController_createBlogPost",
          "summary": "Create new post for specific blog",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogPostDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns the newly created post"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to add post to blog that doesn't belong to current user"
            },
            "404": {
              "description": "If specific blog doesn't exists"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blog-platform/blogger/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BloggerController_updateBlogPost",
          "summary": "Update existing post by id with InputModel",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update post that belongs to blog that doesn't belong to current user"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "BloggerController_deleteBlogPost",
          "summary": "Delete post specified by id",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blog-platform/blogger/users/{userId}/ban": {
        "put": {
          "operationId": "BloggerController_banUserForBlog",
          "summary": "Ban/unban user for blog",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUserForBlogInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blog-platform/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/registration": {
        "post": {
          "operationId": "AuthController_registerUser",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_confirmAccount",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailConfirmationCodeDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_resendConfirmationCode",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Email"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/me": {
        "get": {
          "operationId": "AuthController_me",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_recoveryPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Email"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/auth/new-password": {
        "post": {
          "operationId": "AuthController_confirmRecoveryPassword",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateRecoveryPasswordDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "auth"
          ]
        }
      },
      "/blog-platform/security": {
        "post": {
          "operationId": "SecurityController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateSecurityDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "securityDevices"
          ]
        }
      },
      "/blog-platform/security/devices": {
        "get": {
          "operationId": "SecurityController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "securityDevices"
          ]
        },
        "delete": {
          "operationId": "SecurityController_removeAllWithoutMyDevice",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "securityDevices"
          ]
        }
      },
      "/blog-platform/security/devices/{id}": {
        "delete": {
          "operationId": "SecurityController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "securityDevices"
          ]
        }
      },
      "/blog-platform/posts": {
        "get": {
          "operationId": "PostsController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "posts"
          ]
        }
      },
      "/blog-platform/posts/{id}": {
        "get": {
          "operationId": "PostsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "posts"
          ]
        }
      },
      "/blog-platform/posts/{id}/comments": {
        "get": {
          "operationId": "PostsController_findPostComments",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "posts"
          ]
        },
        "post": {
          "operationId": "PostsController_createPostComment",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentInput"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          },
          "tags": [
            "posts"
          ]
        }
      },
      "/blog-platform/posts/{id}/like-status": {
        "put": {
          "operationId": "PostsController_likeStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLikeInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "posts"
          ]
        }
      },
      "/blog-platform/testing/all-data": {
        "delete": {
          "operationId": "TestingController_clearDatabase",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "testing"
          ]
        }
      },
      "/blog-platform/testing/send-test-email": {
        "get": {
          "operationId": "TestingController_healthCheckMessageService",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "testing"
          ]
        }
      },
      "/blog-platform/comments/{id}": {
        "get": {
          "operationId": "CommentsController_findOne",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "comments"
          ]
        },
        "put": {
          "operationId": "CommentsController_update",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CommentInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "comments"
          ]
        },
        "delete": {
          "operationId": "CommentsController_remove",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "comments"
          ]
        }
      },
      "/blog-platform/comments/{id}/like-status": {
        "put": {
          "operationId": "CommentsController_likeStatus",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateLikeInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "comments"
          ]
        }
      },
      "/blog-platform/sa/blogs": {
        "get": {
          "operationId": "SuperAdminController_findBlogs",
          "summary": "Returns blogs with paging",
          "parameters": [],
          "responses": {
            "200": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/blog-platform/sa/blogs/{blogId}/bind-with-user/{userId}": {
        "put": {
          "operationId": "SuperAdminController_bindBlogOnUser",
          "summary": "Bind Blog with user (if blog doesn't have an owner yet)",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values or blog already bound to any user"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/blog-platform/sa/blogs/{blogId}/ban": {
        "put": {
          "operationId": "SuperAdminController_banBlog",
          "summary": "Bun/unban blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanBlogInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/blog-platform/sa/users/{userId}/ban": {
        "put": {
          "operationId": "SuperAdminController_banUser",
          "summary": "Ban/unban user",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUnbanUserInput"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/blog-platform/sa/users": {
        "post": {
          "operationId": "SuperAdminController_create",
          "summary": "Add new user to the system",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns the newly created user"
            },
            "400": {
              "description": "If the inputModel has incorrect values"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        },
        "get": {
          "operationId": "SuperAdminController_findUsers",
          "summary": "Returns blogs users",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success"
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      },
      "/blog-platform/sa/users/{id}": {
        "delete": {
          "operationId": "SuperAdminController_remove",
          "summary": "Delete user specified by id",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If specified user is not exists"
            }
          },
          "tags": [
            "superAdmin"
          ],
          "security": [
            {
              "basic": []
            }
          ]
        }
      }
    },
    "info": {
      "title": "Blog platform",
      "description": "Sorry I'm working on new features and don't have time to write swagger documentation. But in time it will be completely written",
      "version": "0.15.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "auth",
        "description": ""
      },
      {
        "name": "blogger",
        "description": ""
      },
      {
        "name": "blogs",
        "description": ""
      },
      {
        "name": "comments",
        "description": ""
      },
      {
        "name": "posts",
        "description": ""
      },
      {
        "name": "securityDevices",
        "description": ""
      },
      {
        "name": "testing",
        "description": ""
      },
      {
        "name": "superAdmin",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "CreateBlogInput": {
          "type": "object",
          "properties": {}
        },
        "UpdateBlogDto": {
          "type": "object",
          "properties": {}
        },
        "CreateBlogPostDto": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostDto": {
          "type": "object",
          "properties": {}
        },
        "BanUserForBlogInput": {
          "type": "object",
          "properties": {}
        },
        "LoginDto": {
          "type": "object",
          "properties": {}
        },
        "CreateUserDto": {
          "type": "object",
          "properties": {}
        },
        "EmailConfirmationCodeDto": {
          "type": "object",
          "properties": {}
        },
        "Email": {
          "type": "object",
          "properties": {}
        },
        "CreateRecoveryPasswordDto": {
          "type": "object",
          "properties": {}
        },
        "CreateSecurityDto": {
          "type": "object",
          "properties": {}
        },
        "CommentInput": {
          "type": "object",
          "properties": {}
        },
        "CreateLikeInput": {
          "type": "object",
          "properties": {}
        },
        "BanBlogInput": {
          "type": "object",
          "properties": {}
        },
        "BanUnbanUserInput": {
          "type": "object",
          "properties": {}
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
