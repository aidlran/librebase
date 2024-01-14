const uuidRegex =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

function checkUUID(uuid: string) {
  return uuidRegex.test(uuid);
}

export function checkAppID(appID: string) {
  return checkUUID(appID);
}
