
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
      "/": {
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
      "/blogs": {
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
      "/blogs/{id}": {
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
      "/blogs/{id}/posts": {
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
      "/blogger/blogs": {
        "post": {
          "operationId": "BloggerController_create",
          "summary": "Create new blog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogDto"
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
              "description": "Success"
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
      "/blogger/blogs/{id}": {
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
      "/blogger/blogs/{id}/posts": {
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
        },
        "put": {
          "operationId": "BloggerController_updateBlogPost",
          "summary": "Update existing post by id with InputModel",
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
      "/auth/login": {
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
      "/auth/registration": {
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
      "/auth/registration-confirmation": {
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
      "/auth/registration-email-resending": {
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
      "/auth/me": {
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
      "/auth/refresh-token": {
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
      "/auth/logout": {
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
      "/auth/password-recovery": {
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
      "/auth/new-password": {
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
      "/users": {
        "post": {
          "operationId": "UsersController_create",
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
              "description": ""
            }
          },
          "tags": [
            "users"
          ]
        },
        "get": {
          "operationId": "UsersController_findAll",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "users"
          ]
        }
      },
      "/users/{id}": {
        "delete": {
          "operationId": "UsersController_remove",
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
            "users"
          ]
        }
      },
      "/security": {
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
      "/security/devices": {
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
      "/security/devices/{id}": {
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
      "/posts": {
        "post": {
          "operationId": "PostsController_create",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostDto"
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
        },
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
      "/posts/{id}": {
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
        },
        "put": {
          "operationId": "PostsController_update",
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
                  "$ref": "#/components/schemas/UpdatePostDto"
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
        },
        "delete": {
          "operationId": "PostsController_remove",
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
            "posts"
          ]
        }
      },
      "/posts/{id}/comments": {
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
      "/posts/{id}/like-status": {
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
      "/testing/all-data": {
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
      "/testing/send-test-email": {
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
      "/comments/{id}": {
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
      "/comments/{id}/like-status": {
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
      }
    },
    "info": {
      "title": "Blog platform",
      "description": "Sorry I'm working on new features and don't have time to write swagger documentation. But in time it will be completely written",
      "version": "0.14.7",
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
        "name": "users",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "CreateBlogDto": {
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
        "CreatePostDto": {
          "type": "object",
          "properties": {}
        },
        "UpdatePostDto": {
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
