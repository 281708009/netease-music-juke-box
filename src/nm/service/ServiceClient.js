const NM_API_URL = "/api";

export default class ServiceClient {
    constructor() {
        this._userId = null;
    }

    get userId() {
        return this._userId;
    }

    async login() {
        await this.__pseudoLogin();
    }

    async __pseudoLogin() {
        this._userId = "40652589";
    }

    async getUserPlayLists(uid = this.userId) {
        let res = null;

        try {
            res = await $.ajax({
                url: `${NM_API_URL}/user/playlist/`,
                data: {
                    uid,
                    limit: 1000,
                    offset: 0
                }
            })
        }
        catch (e) {
            console.log(e);
        }

        if (res.code === 200) {
            return res.playlist;
        }
        else {
            console.log("err");
        }
    }

    async getPlayListDetail(id)
    {
        let res = null;

        try {
            res = await $.ajax({
                url: `${NM_API_URL}/playlist/detail`,
                data: {
                    id
                }
            });
        }
        catch (e) {
            console.log(e);
        }

        if (res.code === 200) {
            return res.result;
        }
        else {
            console.log("err");
        }
    }
}


let __instance = null;
ServiceClient.getInstance = function()
{
    if (__instance === null)
    {
        __instance = new ServiceClient();
    }
    return __instance;
};
