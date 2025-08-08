"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByUsername = findUserByUsername;
exports.comparePassword = comparePassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Erstellt ein neuen User-Eintrag (Passwort wird gehashed)
async function createUser(userCollection, userData) {
    const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
    const user = {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date()
    };
    const result = await userCollection.insertOne(user);
    return { ...user, _id: result.insertedId };
}
// Holt User per Username
async function findUserByUsername(userCollection, username) {
    return await userCollection.findOne({ username });
}
// Passwortvergleich (Login)
async function comparePassword(inputPassword, hashedPassword) {
    return await bcrypt_1.default.compare(inputPassword, hashedPassword);
}
