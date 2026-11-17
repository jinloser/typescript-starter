import { MigrationInterface, QueryRunner } from "typeorm";

export class DropLeftoverFkIndexes20261117144000 implements MigrationInterface {
    name = 'DropLeftoverFkIndexes20261117144000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_role_menus_menu\` ON \`role_menus\``);
        await queryRunner.query(`DROP INDEX \`FK_user_roles_role\` ON \`user_roles\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`FK_user_roles_role\` ON \`user_roles\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_role_menus_menu\` ON \`role_menus\` (\`menu_id\`)`);
    }

}
