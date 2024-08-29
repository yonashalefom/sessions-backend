import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { RouterModule as NestJsRouterModule } from '@nestjs/core';
import { RoutesExpertModule } from 'src/router/routes/routes.expert.module';
import { RoutesUserModule } from 'src/router/routes/routes.user.module';
import { RoutesPublicModule } from 'src/router/routes/routes.public.module';
import { RoutesAdminModule } from 'src/router/routes/routes.admin.module';
import { RoutesSystemModule } from 'src/router/routes/routes.system.module';
import { RoutesSharedModule } from 'src/router/routes/routes.shared.module';

@Module({})
export class RouterModule {
    static forRoot(): DynamicModule {
        const imports: (
            | DynamicModule
            | Type<any>
            | Promise<DynamicModule>
            | ForwardReference<any>
        )[] = [];

        if (process.env.HTTP_ENABLE === 'true') {
            imports.push(
                RoutesPublicModule,
                RoutesSystemModule,
                RoutesExpertModule,
                RoutesUserModule,
                RoutesAdminModule,
                RoutesSharedModule,
                NestJsRouterModule.register([
                    {
                        path: '/public',
                        module: RoutesPublicModule,
                    },
                    {
                        path: '/system',
                        module: RoutesSystemModule,
                    },
                    {
                        path: '/admin',
                        module: RoutesAdminModule,
                    },
                    {
                        path: '/expert',
                        module: RoutesExpertModule,
                    },
                    {
                        path: '/user',
                        module: RoutesUserModule,
                    },
                    {
                        path: '/shared',
                        module: RoutesSharedModule,
                    },
                ])
            );
        }

        return {
            module: RouterModule,
            providers: [],
            exports: [],
            controllers: [],
            imports,
        };
    }
}
