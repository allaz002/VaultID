import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    private users: User[] = [];
    private idCounter = 1;

    async createUser(email: string, passwordHash: string, name?: string): Promise<User> {
        const user: User ={
            id: this.idCounter++,
            email,
            passwordHash,
            name,
        };
        this.users.push(user);
        return user;
    }

    async findByEmail(email:string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
    }

    async findById(id: number): Promise<User | undefined> {
        return this.users.find(user=> user.id == id);
    }
        
}
