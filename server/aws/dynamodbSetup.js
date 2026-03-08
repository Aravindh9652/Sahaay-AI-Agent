/**
 * DynamoDB Table Setup
 * Ensures the users table exists in DynamoDB
 * Runs on server startup
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'sahaay-users';

/**
 * Create users table if it doesn't exist
 */
async function ensureUsersTableExists() {
  try {
    // Check if table exists
    const listResult = await dynamodbClient.send(new ListTablesCommand({}));
    
    if (listResult.TableNames && listResult.TableNames.includes(USERS_TABLE)) {
      console.log(`[DynamoDB] Table "${USERS_TABLE}" already exists`);
      return true;
    }

    console.log(`[DynamoDB] Creating table "${USERS_TABLE}"...`);

    // Create table
    const createResult = await dynamodbClient.send(new CreateTableCommand({
      TableName: USERS_TABLE,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' } // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'email-index',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand pricing (no provisioned throughput needed)
      Tags: [
        { Key: 'Application', Value: 'sahaay' },
        { Key: 'Environment', Value: process.env.NODE_ENV || 'development' }
      ]
    }));

    console.log(`[DynamoDB] Table "${USERS_TABLE}" created successfully`);
    console.log(`[DynamoDB] Email index created for fast lookups`);
    return true;

  } catch (error) {
    // Table might already exist or be in creation
    if (error.name === 'ResourceInUseException') {
      console.log(`[DynamoDB] Table "${USERS_TABLE}" is being created or already exists`);
      return true;
    }

    if (error.name === 'ValidationException') {
      console.warn(`[DynamoDB] Validation error (table might exist): ${error.message}`);
      return true;
    }

    console.error(`[DynamoDB] Failed to ensure table exists: ${error.message}`);
    console.warn(`[DynamoDB] Continuing without table creation (might use AWS admin console or local DynamoDB)`);
    return false;
  }
}

const QUERIES_TABLE = process.env.DYNAMODB_QUERIES_TABLE || 'sahaay-queries';

/**
 * Create queries table if it doesn't exist
 */
async function ensureQueriesTableExists() {
  try {
    const listResult = await dynamodbClient.send(new ListTablesCommand({}));

    if (listResult.TableNames && listResult.TableNames.includes(QUERIES_TABLE)) {
      console.log(`[DynamoDB] Table "${QUERIES_TABLE}" already exists`);
      return true;
    }

    console.log(`[DynamoDB] Creating table "${QUERIES_TABLE}"...`);

    await dynamodbClient.send(new CreateTableCommand({
      TableName: QUERIES_TABLE,
      KeySchema: [
        { AttributeName: 'queryId', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'queryId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      Tags: [
        { Key: 'Application', Value: 'sahaay' },
        { Key: 'Environment', Value: process.env.NODE_ENV || 'development' }
      ]
    }));

    console.log(`[DynamoDB] Table "${QUERIES_TABLE}" created successfully`);
    return true;

  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`[DynamoDB] Table "${QUERIES_TABLE}" is being created or already exists`);
      return true;
    }
    console.error(`[DynamoDB] Failed to create queries table: ${error.message}`);
    return false;
  }
}

module.exports = {
  ensureUsersTableExists,
  ensureQueriesTableExists
};
