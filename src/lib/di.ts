import type { TeamRepository } from "@/repositories/team-repository";
import { AdminTeamRepositoryImpl } from "@/repositories/admin/team-repository";

let _adminTeamRepositoryFactory: (() => TeamRepository) | null = null;

export function registerAdminTeamRepositoryFactory(factory: () => TeamRepository) {
    _adminTeamRepositoryFactory = factory;
}

export function getAdminTeamRepository(): TeamRepository {
    if (_adminTeamRepositoryFactory) return _adminTeamRepositoryFactory();
    return new AdminTeamRepositoryImpl();
}
