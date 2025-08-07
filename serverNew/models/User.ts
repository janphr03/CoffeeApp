import { Collection, Document, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

// User Interface
export interface IUser extends Document {
  _id?: ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
}

// Erstellt ein neuen User-Eintrag (Passwort wird gehashed)
export async function createUser(userCollection: Collection<IUser>, userData: Omit<IUser, 'createdAt'>): Promise<IUser> {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user: IUser = {
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    createdAt: new Date()
  };

  const result = await userCollection.insertOne(user);
  return { ...user, _id: result.insertedId };
}

// Holt User per Username
export async function findUserByUsername(userCollection: Collection<IUser>, username: string): Promise<IUser | null> {
  return await userCollection.findOne({ username });
}

// Passwortvergleich (Login)
export async function comparePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(inputPassword, hashedPassword);
}
