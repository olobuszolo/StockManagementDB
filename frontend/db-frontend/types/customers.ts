export type BusinessEntityCreate = {
    name: string;
    email: string;
    nip: string;
}

export type BusinessEntity = BusinessEntityCreate & {
    id: number;
}