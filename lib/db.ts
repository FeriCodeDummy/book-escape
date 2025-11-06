// lib/db.ts
import mysql from "mysql2/promise";
import GetDBSettings from "@/conf/IDB";

export const pool = mysql.createPool(GetDBSettings());


