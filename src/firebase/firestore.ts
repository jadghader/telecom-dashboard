// src/firebase/firestore.ts
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// Function to read data from Firestore
export const getData = async (collection: string, docId: string) => {
  const docRef = doc(db, collection, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};

// Function to write or update data in Firestore
export const setData = async (collection: string, docId: string, data: any) => {
  const docRef = doc(db, collection, docId);
  await setDoc(docRef, data);
};

// Function to update specific fields in a document
export const updateData = async (collection: string, docId: string, data: any) => {
  const docRef = doc(db, collection, docId);
  await updateDoc(docRef, data);
};

// Function to delete a document
export const deleteData = async (collection: string, docId: string) => {
  const docRef = doc(db, collection, docId);
  await deleteDoc(docRef);
};
