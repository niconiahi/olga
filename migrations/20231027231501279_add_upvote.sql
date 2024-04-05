CREATE TABLE "upvote" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "cut_id" INTEGER NOT NULL,
  "user_id" TEXT NOT NULL,
  FOREIGN KEY(cut_id) REFERENCES cut(id),
  FOREIGN KEY(user_id) REFERENCES user(id)
);