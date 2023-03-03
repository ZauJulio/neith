import { App, AppStatic, SwaggerDocs } from '@types';
import { debug } from '@utils';

export class AppService {
  log = debug('app:service');

  constructor(private app: App) {
    this.buildStaticFiles();
    this.buildDocs();
  }

  buildStaticFiles() {
    this.app.use(AppStatic('public'));

    this.log('Static files served from public folder');
  }

  buildDocs() {
    this.app.use(
      '/docs',
      SwaggerDocs.serve,
      SwaggerDocs.setup(undefined, {
        swaggerOptions: { url: '/openapi.yaml' },
      }),
    );

    this.log('Swagger docs served from /docs');
  }
}

export function registerAppService(props: { app: App }) {
  return new AppService(props.app);
}
