import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../entities/User.js';

export default setSeederFactory(User, (faker) => {
    const user = new User();
    user.id = faker.string.uuid();
    user.firstName = faker.person.firstName()
    user.lastName = faker.person.lastName();
    user.email = faker.internet.email({ firstName: user.firstName, lastName: user.lastName })

    return user;
})