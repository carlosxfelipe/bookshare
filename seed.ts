import { db } from "./db";

export async function seed() {
  const check = await db.execute("SELECT COUNT(*) as count FROM books");
  const count = check.rows[0].count as number;

  if (count > 0) {
    return;
  }

  const seedBooks = [
    {
      id: crypto.randomUUID(),
      title: "Dom Casmurro",
      author: "Machado de Assis",
      isbn: "9788573263447",
      publishedDate: "1899-01-01",
      available: 1,
    },
    {
      id: crypto.randomUUID(),
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      publishedDate: "1949-06-08",
      available: 1,
    },
    {
      id: crypto.randomUUID(),
      title: "O Pequeno Príncipe",
      author: "Antoine de Saint-Exupéry",
      isbn: "9788532270640",
      publishedDate: "1943-04-06",
      available: 0,
    },
  ];

  for (const book of seedBooks) {
    await db.execute({
      sql: `
        INSERT INTO books (id, title, author, isbn, publishedDate, available)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        book.id,
        book.title,
        book.author,
        book.isbn,
        book.publishedDate,
        book.available,
      ],
    });
  }

  console.log("Seed inserido com sucesso");
}
