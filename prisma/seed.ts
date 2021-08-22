import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const usersPayload = [
  {
    email: 'demo0@sosile.demo',
    username: 'mynameisdemo',
    password: 'hehehe',
    displayName: 'JohnsDemos',
  },
  {
    email: 'demo1@sosile.demo',
    username: 'ironman123',
    password: 'iloveironman123',
    displayName: 'Demoman',
  },
  {
    email: 'demo2@sosile.demo',
    username: 'thebestgamer',
    password: 'hehehe',
    displayName: 'Demonator',
  },
  {
    email: 'demo3@sosile.demo',
    username: 'iamrobot',
    password: 'hehehe',
    displayName: 'Mark Demoburg',
  },
  {
    email: 'demo4@sosile.demo',
    username: 'theDEMOcraticparty',
    password: 'hehehe',
    displayName: 'DEMOcraft',
  },
  {
    email: 'demo5@sosile.demo',
    username: 'igotfired',
    password: 'hehehe',
    displayName: 'DEMOted',
  },
];

const postsPayload: Post[] = [
  {
    username: 'mynameisdemo',
    content: 'This is demo content',
  },
  {
    username: 'ironman123',
    content: 'This is demo content',
  },
  {
    username: 'iamrobot',
    content: 'This is demo content',
  },
  {
    username: 'thebestgamer',
    content: 'This is demo content',
  },
  {
    username: 'theDEMOcraticparty',
    content: 'This is demo content',
  },
  {
    username: 'igotfired',
    content: 'This is demo content',
  },
];

interface Post {
  username: string;
  content: string;
}

async function main() {
  await prisma.user.createMany({
    data: usersPayload,
  });
  for (const post in postsPayload) {
    await prisma.post.create({
      data: {
        author: { connect: { username: postsPayload[post].username } },
        content: postsPayload[post].content,
      },
    });
  }
}

main()
  .catch((e) => {
    throw new Error(e);
  })
  .finally(async () => {
    console.log('[SEED] STATUS: DONE');
    await prisma.$disconnect();
  });
