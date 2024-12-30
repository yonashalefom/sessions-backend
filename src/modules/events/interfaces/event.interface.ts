import { EventDoc } from 'src/modules/events/repository/entities/event.entity';
import { UserEntity } from 'src/modules/user/repository/entities/user.entity';

export interface IEventDoc extends Omit<EventDoc, 'owner'> {
    owner: UserEntity;
}
