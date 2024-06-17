import { Sequelize } from "sequelize";

const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;

const sequelize = new Sequelize("price_history", DATABASE_USER || "root", DATABASE_PASSWORD || "root", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
