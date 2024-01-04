const mongoose = require("mongoose");
const Role = require("../models/Role");
const Account = require("../models/Account");
const UserWallet = require("../models/UserWallet");
const ArenaUserDetail = require("../models/ArenaUserDetail");

module.exports = () => {
  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.ATLAS_URI, {});
  mongoose.connection.once("open", () => {
    console.log("connection to database has been established.");
    Role.find().then(roles => {
      if (roles.length === 0) {
        Role.insertMany([
          { _id: "655c087a40f8fdd3e086e8cf", name: "Superadmin", level: 1 },
          { _id: "655c087a40f8fdd3e086e8d0", name: "Moderator", level: 2 },
          { _id: "655c087a40f8fdd3e086e8d1", name: "Accountant", level: 2 },
          { _id: "655c087a40f8fdd3e086e8d2", name: "CSR", level: 2 },
          { _id: "655c087a40f8fdd3e086e8d3", name: "Financer", level: 2 },
          { _id: "655c087a40f8fdd3e086e8d6", name: "Sub", level: 3 },
          { _id: "655c087a40f8fdd3e086e8d4", name: "Master", level: 4 },
          { _id: "655c087a40f8fdd3e086e8d5", name: "Gold", level: 5 },
          { _id: "655c087a40f8fdd3e086e8d7", name: "Player", level: 6 },
        ]).then(async newRoles => {
          const su = await Account.findOne({
            username: process.env.SU_USERNAME,
          });

          if (!su) {
            const suRole = newRoles.find(e => e.name === "Superadmin");
            let account = new Account({
              username: process.env.SU_USERNAME,
              password: process.env.SU_PASSWORD,
              status: "approved",
              active: false,
              roleId: suRole._id,
            });
            account.savePassword(process.env.SU_PASSWORD);
            await account.save();

            new ArenaUserDetail({
              owner: account._id,
              commisionRate: 8,
            }).save();

            UserWallet.insertMany([
              {
                _id: "65640f774c6a1f5621312fdb",
                owner: account._id,
                type: "commission",
              },
              {
                _id: "65640f774c6a1f5621312fdc",
                owner: account._id,
                type: "credit",
              },
              {
                _id: "65640f774c6a1f5621312fdd",
                owner: account._id,
                type: "draw",
              },
            ]);
          }
        });
      }
    });
  });
};
