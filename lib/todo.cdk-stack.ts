import { CorsHttpMethod, HttpIntegrationType, PayloadFormatVersion } from '@aws-cdk/aws-apigatewayv2';
import { HttpApi, HttpMethod,  } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from '@aws-cdk/aws-lambda-nodejs';
import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { join } from 'path';

export class TodoCdkStack extends Stack {
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id);

    const dynamoTable = new Table(this, 'TodosTable-CDK', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      tableName: 'Todos-CDK-demo',
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN, // NOT recommended for production code
    });

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, 'lambdas', 'package-lock.json'),
      environment: {
        TODO_TABLE_NAME: dynamoTable.tableName
      },
      runtime: Runtime.NODEJS_14_X,
    };

    // Create a Lambda function for each of the CRUD operations
    const createOneLambda = new NodejsFunction(this, 'createTodo', {
      entry: join(__dirname, 'lambdas', 'src', 'functions', 'todo', 'handler.ts'),
      handler: 'createTodo',
      ...nodeJsFunctionProps,
    });
    const getAllLambda = new NodejsFunction(this, 'getTodos', {
      entry: join(__dirname, 'lambdas', 'src', 'functions', 'todo', 'handler.ts'),
      handler: 'getTodos',
      ...nodeJsFunctionProps,
    });
    const getOneLambda = new NodejsFunction(this, 'getTodoById', {
      entry: join(__dirname, 'lambdas', 'src', 'functions', 'todo', 'handler.ts'),
      handler: 'getTodoById',
      ...nodeJsFunctionProps,
    });
    const updateOneLambda = new NodejsFunction(this, 'updateTodo', {
      entry: join(__dirname, 'lambdas', 'src', 'functions', 'todo', 'handler.ts'),
      handler: 'updateTodo',
      ...nodeJsFunctionProps,
    });
    const deleteOneLambda = new NodejsFunction(this, 'deleteTodo', {
      entry: join(__dirname, 'lambdas', 'src', 'functions', 'todo', 'handler.ts'),
      handler: 'deleteTodo',
      ...nodeJsFunctionProps,
    });

    // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(updateOneLambda);
    dynamoTable.grantReadWriteData(deleteOneLambda);

    // Create an API Gateway resource for each of the CRUD operations
    const api = new HttpApi(this, 'TodoCDKAPI', {
      apiName: 'Todo-CDK-API',
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent'
        ],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE
        ],
        allowOrigins: ['*'],
      },
    });

    api.addRoutes({
      path: '/todo',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({
        handler: createOneLambda
      })
    });
    api.addRoutes({
      path: '/todo',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getAllLambda
      })
    });
    api.addRoutes({
      path: '/todo/{id}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({
        handler: getOneLambda
      })
    });
    api.addRoutes({
      path: '/todo/{id}',
      methods: [HttpMethod.PUT],
      integration: new LambdaProxyIntegration({
        handler: updateOneLambda
      })
    });
    api.addRoutes({
      path: '/todo/{id}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({
        handler: deleteOneLambda
      })
    });

    new CfnOutput(this, 'apiUrl', {
      value: api.url!,
    });
  }
}
