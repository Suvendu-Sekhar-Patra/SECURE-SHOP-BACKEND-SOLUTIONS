/*
import { createClient } from 'redis';

const redisUrl = 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});


const redisClient = createClient({
  password: 'az1DeI0y6MQqPE0MHuopKBiO7YvJZNL3',
  socket: {
      host: 'redis-14242.c326.us-east-1-3.ec2.redns.redis-cloud.com',
      port: 14242
  }
});


const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connect successfully');
    redisClient.set('try', 'Hello Welcome to Express with TypeORM');
  } catch (error) {
    console.log(error);
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

export default redisClient;
*/