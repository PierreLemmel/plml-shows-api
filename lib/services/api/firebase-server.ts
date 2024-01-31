import { firebasePlmlOptions } from "./firebase";
import { Storage } from "@google-cloud/storage";
import { isBlob, pathCombine } from "../core/files";

let serverSideStorage: Storage|null = null;
function getServerSideStorage(): Storage {

    if (!serverSideStorage) {
        const { projectId } = firebasePlmlOptions;

        const {
            GCLOUD_PRIVATE_KEY_ID: private_key_id,
            GCLOUD_PRIVATE_KEY: private_key,
            GCLOUD_CLIENT_EMAIL: client_email,
            GCLOUD_CLIENT_ID: client_id,
        } = process.env;

        if (!private_key_id) {
            throw "GCLOUD_PRIVATE_KEY_ID is missing";
        }

        if (!private_key) {
            throw "GCLOUD_PRIVATE_KEY is missing";
        }

        if (!client_email) {
            throw "GCLOUD_CLIENT_EMAIL is missing";
        }

        if (!client_id) {
            throw "GCLOUD_CLIENT_ID is missing";
        }

        serverSideStorage = new Storage({
            projectId: projectId,
            credentials: {
                type: "service_account",
                project_id: projectId,
                private_key_id,
                private_key: private_key.split(String.raw`\n`).join('\n'),
                client_email,
                client_id,
            },
        });   
    }
    
    return serverSideStorage;
}

export async function uploadFile_serverSide(folder: string, data: Blob|Uint8Array|Buffer, name: string) {

    const storage = getServerSideStorage();

    const bucket = storage.bucket(firebasePlmlOptions.storageBucket);
    
    const path = pathCombine(folder, name);
    const file = bucket.file(path, { });

    const contentType = isBlob(data) ? data.type : undefined;
    const blobStream = file.createWriteStream({ contentType });

    if (isBlob(data)) {
        data.arrayBuffer();
    }

    const bufferOrUint8Array = !isBlob(data) ? data : Buffer.from(await data.arrayBuffer());

    blobStream.end(bufferOrUint8Array);

    const downloadUrls = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
    });

    return {
        path,
        fileName: name,
        downloadUrl: downloadUrls[0],
    }
}