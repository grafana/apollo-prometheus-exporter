import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import { createPrometheusExporterPlugin } from '../../lib/src';

import { createTracingPlugin } from './create-tracing-plugin';
import { readSchema } from './read-schema';
import { resolvers } from './resolvers';

export function startServer(port: number = 4000, hostname: string = '0.0.0.0') {
  const app = express();

  const typeDefs = readSchema();

  const prometheusExporterPlugin = createPrometheusExporterPlugin({
    app
  });

  const server = new ApolloServer({
    logger: console,
    typeDefs,
    resolvers,
    plugins: [prometheusExporterPlugin, createTracingPlugin()]
  });

  server.applyMiddleware({ app, path: '/' });

  try {
    app.listen(port, hostname, () => {
      console.log(`🚀 App listening at http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error('💥 Failed to start app!', error);
  }
}
