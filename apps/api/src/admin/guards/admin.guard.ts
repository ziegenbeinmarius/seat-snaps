import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { USER_REPOSITORY } from "../../domain/repositories/IUserRepository";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { id?: string } }>();
    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException("Admin access required");

    const user = await this.userRepository.findById(userId);
    if (!user?.isAdmin) throw new ForbiddenException("Admin access required");

    return true;
  }
}
