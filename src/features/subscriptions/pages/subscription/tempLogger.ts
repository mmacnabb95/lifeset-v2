export let log: string = "";
export const logger = (text: string, o?: object) => {
  let olog = "";
  if (o) {
    olog = JSON.stringify(o, null, 2);
  }
  log = log + "\r\n" + text + "\r\n" + olog;
};
