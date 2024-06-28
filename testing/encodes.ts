export const encodes: [ascii: string, bytes: Uint8Array, base58: string, base64: string][] = [
  ['', new Uint8Array(), '', ''],
  ['L1br3', new Uint8Array([0x4c, 0x31, 0x62, 0x72, 0x33]), '9bacYYA', 'TDFicjM='],
  ['B4s3d', new Uint8Array([0x42, 0x34, 0x73, 0x33, 0x64]), '8UDqqN3', 'QjRzM2Q='],
  ['Howdy', new Uint8Array([0x48, 0x6f, 0x77, 0x64, 0x79]), '9AzXVWQ', 'SG93ZHk='],
];
