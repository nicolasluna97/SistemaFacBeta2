// import { User } from "../../auth/interfaces/user.interface";


export interface Product {
    id: string;
    title: string;
    stock: number;
    price: string;
    price2: string;
    price3: string;
    price4: string;
    userId: string;
    // user: User;
}

export interface ProductsResponse extends Array<Product> {}
