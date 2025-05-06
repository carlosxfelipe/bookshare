import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { db } from "./db";
import type { Book } from "./model";
import { seed } from "./seed";

const app = new Elysia();

app.use(
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "BookShare API",
        version: "1.0.0",
        description: "API para empréstimo e devolução de livros entre alunos",
      },
    },
  })
);

await db.execute(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    isbn TEXT,
    publishedDate TEXT,
    available INTEGER
  )
`);

await seed();

app.get("/api/books", async () => {
  const result = await db.execute("SELECT * FROM books");
  return result.rows;
});

app.get("/api/books/:id", async ({ params }) => {
  const result = await db.execute({
    sql: "SELECT * FROM books WHERE id = ?",
    args: [params.id],
  });

  if (result.rows.length === 0) {
    return new Response("Book not found", { status: 404 });
  }

  return result.rows[0];
});

app.post("/api/books", async ({ body }) => {
  const book = body as Book;

  if (!book.title || !book.author || !book.isbn || !book.publishedDate) {
    return new Response("Missing fields", { status: 400 });
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: `
      INSERT INTO books (id, title, author, isbn, publishedDate, available)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      book.title,
      book.author,
      book.isbn,
      book.publishedDate,
      book.available ? 1 : 0,
    ],
  });

  return { id, ...book };
});

app.put("/api/books/:id", async ({ params, body }) => {
  const book = body as Book;

  const result = await db.execute({
    sql: `
      UPDATE books SET title = ?, author = ?, isbn = ?, publishedDate = ?, available = ?
      WHERE id = ?
    `,
    args: [
      book.title,
      book.author,
      book.isbn,
      book.publishedDate,
      book.available ? 1 : 0,
      params.id,
    ],
  });

  if (result.rowsAffected === 0) {
    return new Response("Book not found", { status: 404 });
  }

  return { id: params.id, ...book };
});

app.delete("/api/books/:id", async ({ params }) => {
  const result = await db.execute({
    sql: "DELETE FROM books WHERE id = ?",
    args: [params.id],
  });

  if (result.rowsAffected === 0) {
    return new Response("Book not found", { status: 404 });
  }

  return { success: true };
});

app.listen(3000, () => {
  console.log("Swagger em http://localhost:3000/docs");
});
