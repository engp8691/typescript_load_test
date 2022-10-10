import {spawn} from 'child_process';

const CHILD_PROCESSES = 20;
const URL = 'https://www.google.com/';

(async () => {
  const times: number[] = [];
  const children = [];

  for (let i = 0; i < CHILD_PROCESSES; i++) {
    const childProcess = spawn(`npx ts-node ./source/child.ts --url=${URL}`, { shell: true })
    children.push(childProcess);
  }

  let responses: Promise<any>[] = children.map(function wait(child) {
    return new Promise(function c(res) {
      child.stdout.on('data', (data: string) => {
        console.log(`child stdout: ${data}`);
        times.push(parseInt(data));
      });
      child.on("exit", function (code: number) {
        if (code === 0) {
          res(true);
        } else {
          res(false);
        }
      });
    });
  });

  responses = await Promise.all(responses);

  if (responses.filter(Boolean).length == responses.length) {
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = (sum / times.length) || 0;
    console.log(`average: ${avg}`);
    console.log("success!");
  } else {
    console.log("failures!");
  }
})();