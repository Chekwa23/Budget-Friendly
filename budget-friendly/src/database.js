import { openDB } from "idb";

const yourStoreName = "billList";

const dbPromise = openDB("BudgetFriendly", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(yourStoreName)) {
      db.createObjectStore(yourStoreName);
    }
  },
});

export const dbGet = async (key) => {
  return (await dbPromise).get(yourStoreName, key);
};

export const dbSet = async (key, val) => {
  return (await dbPromise).put(yourStoreName, val, key);
};

export const dbDelete = async (key) => {
  return (await dbPromise).delete(yourStoreName, key);
};
