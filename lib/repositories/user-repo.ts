import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type InsertUser, type User } from "../db/schema";

export const userRepository = {
  /**
   * Create a new user
   */
  create: async (data: Omit<InsertUser, "id" | "createdAt">): Promise<User> => {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  /**
   * Find user by ID
   */
  findById: async (id: string): Promise<User | undefined> => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email: string): Promise<User | undefined> => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  /**
   * Update user
   */
  update: async (id: string, data: Partial<Omit<InsertUser, "id">>): Promise<User> => {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await db.delete(users).where(eq(users.id, id));
  },

  /**
   * List all users
   */
  list: async (): Promise<User[]> => {
    return await db.select().from(users);
  },
};
