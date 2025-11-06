export interface IDBSettings {
    host: string
    port: number
    user: string
    password: string
    database: string
    waitForConnections: boolean
    connectionLimit: number
}

const GetDBSettings = (): IDBSettings => {
    return {
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'bookescape',
        password: '',
        waitForConnections: true,
        connectionLimit: 10,
        }
}

export default GetDBSettings;




