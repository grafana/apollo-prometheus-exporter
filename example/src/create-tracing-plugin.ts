import OpentracingPlugin, { SpanContext } from 'apollo-opentracing';
import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base';
import { initTracer, PrometheusMetricsFactory } from 'jaeger-client';
import log4js from 'log4js';
import { Span } from 'opentracing';
import * as promClient from 'prom-client';

export function createTracingPlugin(): ApolloServerPlugin<SpanContext> {
  const serviceName = 'apollo-example';

  const metrics = new PrometheusMetricsFactory(promClient as any, 'apollo_server');

  const tracer = initTracer(
    {
      serviceName,
      reporter: {
        collectorEndpoint: 'http://agent:14268/api/traces'
      },
      sampler: {
        type: 'const',
        param: 1
      }
    },
    {
      tags: {
        [`${serviceName}.version`]: '1.0.0'
      },
      logger: log4js.getLogger(),
      metrics
    }
  );

  return OpentracingPlugin({
    server: tracer,
    local: tracer,
    onRequestResolve: (span: Span, info: GraphQLRequestContext) => {
      info.context.spanId = span.context().toSpanId();
      span.addTags({
        requestId: info.context.requestId
      });
    }
  });
}
