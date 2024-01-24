import { db } from "@src/models";

export const getGoalHintFromDB = async (goalId: string) => {
  const hint = await db.hintsCollection.where("id").equals(goalId).toArray();
  return hint.length > 0 ? hint[0].hint : null;
};

export const saveHintInDb = async (goalId: string, hint: boolean) => {
  const hintObject = { id: goalId, hint };
  await db
    .transaction("rw", db.hintsCollection, async () => {
      await db.hintsCollection.add(hintObject);
    })
    .catch((e) => {
      console.log(e.stack || e);
    });
};
