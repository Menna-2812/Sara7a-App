
import { HashEnum } from '../../Utils/enums/security.enum.js';
import { compareHash, generateHash } from '../../Utils/security/hash.security.js';
import { create, findOne } from './../../DB/database.repository.js';
import UserModel from './../../DB/Models/user.model.js';
import { BadRequestException, conflictException, NotFoundException } from './../../Utils/responnse/error.response.js';
import { successResponse } from './../../Utils/responnse/success.response.js';
import { encrypt } from './../../Utils/security/encryption.security.js';

export const signUp = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    //Check is user already exist
    if (await findOne({ model: UserModel, filter: { email } })) {
        throw conflictException({ message: "User Already Exists" });
    }

    //Hash the Password
    const hashPassword = await generateHash({
        plainText: password,
        algo: HashEnum.Bcrypt
    });

    //Encrypt The Phone 
    const encryptedPhone = await encrypt(phone);

    const user = await create({
        model: UserModel,
        data: [{ firstName, lastName, email, password: hashPassword, phone: encryptedPhone }]
    });

    return successResponse({
        res,
        statusCode: 201,
        message: "User Added Successfully",
        data: { user }
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await findOne({ model: UserModel, filter: { email, password } })
    if (!(await findOne({ model: UserModel, filter: { email } }))) {
        throw NotFoundException({ message: "User Not Found" });
    }

    const isPasswordValid = await compareHash({
        plainText: password,
        cipherText: user.password,
        algo: HashEnum.Bcrypt
    })

    if (!isPasswordValid) {
        throw BadRequestException({
            message: "Invalid Email OR Password"
        })
    }

    return successResponse({
        res,
        statusCode: 201,
        message: "Login Successfully",
        data: { user }
    })
};