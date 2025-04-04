import { comparePasswordUtils, hashPasswordUtils } from "./untils";

async function testBcrypt() {
  const plainPassword = "123";
  const hashedPassword = await hashPasswordUtils(plainPassword);
  console.log("Hashed Password:", hashedPassword);

  const isMatch = hashedPassword
    ? await comparePasswordUtils(plainPassword, hashedPassword)
    : false;
  console.log("Password Match:", isMatch);
}

testBcrypt();
export default testBcrypt;
