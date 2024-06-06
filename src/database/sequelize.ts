import { Sequelize } from "sequelize";

const sequelize = new Sequelize("price_history", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

export default sequelize;
