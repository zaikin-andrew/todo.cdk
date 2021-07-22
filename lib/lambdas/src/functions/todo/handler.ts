import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { initDynamoDB } from '@libs/dynamoDb';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { ITodo, Todo } from '../../models/Todo';

import schema from './schema';
const dynamo = initDynamoDB();

const todoTable = new Todo(dynamo, process.env.TODO_TABLE_NAME!)

const createItem: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log(event)
  return formatJSONResponse(await todoTable.putItem(event.body as ITodo));
};
const getItems: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  return formatJSONResponse(await todoTable.getAll());
};
const getItemById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  return formatJSONResponse(await todoTable.getItem(event.pathParameters.id));
};
const updateItem: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  return formatJSONResponse(await todoTable.updateItem(event.pathParameters.id, event.body.completed));
};
const deleteItem: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  return formatJSONResponse(await todoTable.deleteItem(event.pathParameters.id));
};


export const createTodo = middyfy(createItem);
export const getTodos = middyfy(getItems);
export const getTodoById = middyfy(getItemById);
export const updateTodo = middyfy(updateItem);
export const deleteTodo = middyfy(deleteItem);
