import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import type { EventTheme } from "@seat-snaps/db";
import type { UpdateThemeInput } from "@seat-snaps/shared";
import type { IEventThemeRepository } from "../domain/repositories/IEventThemeRepository";
import { EVENT_THEME_REPOSITORY } from "../domain/repositories/IEventThemeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IThemeService } from "./domain/IThemeService";

const PRESETS: Record<string, { primaryColor: string; secondaryColor: string }> = {
  wedding: { primaryColor: "#d4a0a0", secondaryColor: "#f5e6e0" },
  birthday: { primaryColor: "#f59e0b", secondaryColor: "#fef3c7" },
  corporate: { primaryColor: "#1e40af", secondaryColor: "#eff6ff" },
  default: { primaryColor: "#3b82f6", secondaryColor: "#eff6ff" },
};

@Injectable()
export class ThemesService implements IThemeService {
  constructor(
    @Inject(EVENT_THEME_REPOSITORY)
    private readonly themeRepository: IEventThemeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async getTheme(eventId: string): Promise<EventTheme | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    return this.themeRepository.findByEventId(eventId);
  }

  async updateTheme(eventId: string, data: UpdateThemeInput, userId: string): Promise<EventTheme> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");

    const updates: Record<string, string | null | undefined> = {};

    if (data.preset && PRESETS[data.preset]) {
      const preset = PRESETS[data.preset];
      updates.primaryColor = preset.primaryColor;
      updates.secondaryColor = preset.secondaryColor;
    }

    if (data.primaryColor !== undefined) updates.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updates.secondaryColor = data.secondaryColor;
    if (data.logoUrl !== undefined) updates.logoUrl = data.logoUrl;
    if (data.backgroundUrl !== undefined) updates.backgroundUrl = data.backgroundUrl;

    return this.themeRepository.upsert(eventId, updates);
  }
}
