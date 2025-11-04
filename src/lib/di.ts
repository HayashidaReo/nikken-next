import type { AdminTeamRepository as AdminTeamRepositoryInterface } from "@/repositories/admin/team-repository";
import { AdminTeamRepositoryImpl } from "@/repositories/admin/team-repository";

let _adminTeamRepositoryFactory: (() => AdminTeamRepositoryInterface) | null = null;

export function registerAdminTeamRepositoryFactory(factory: () => AdminTeamRepositoryInterface) {
    _adminTeamRepositoryFactory = factory;
}

export function getAdminTeamRepository(): AdminTeamRepositoryInterface {
    if (_adminTeamRepositoryFactory) return _adminTeamRepositoryFactory();
    return new AdminTeamRepositoryImpl();
}
