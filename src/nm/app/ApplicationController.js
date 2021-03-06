import NJUApplicationController from "../../nju/app/ApplicationController";

import Application from "./Application";
import ServiceClient from "../service/ServiceClient";

export default class ApplicationController extends NJUApplicationController {

    init() {
        super.init();
        this._playLists = [];
        this._activePlayList = null;
        this._activeTrack = null;
    }

    get playLists() {
        return this._playLists;
    }
    set playLists(playLists) {
        this._playLists = playLists;
        this._onPlayListsChanged();
    }

    get activePlayList() {
        return this._activePlayList;
    }
    set activePlayList(activePlayList) {
        if (this._activePlayList !== activePlayList) {
            this._activePlayList = activePlayList;
            this._onActivePlayListChanged();
        }
    }

    get activeTrack() {
        return this._activeTrack;
    }
    set activeTrack(activeTrack) {
        if (this._activeTrack !== activeTrack) {
            this._activeTrack = activeTrack;
            this._onActiveTrackChanged();
        }
    }

    createApplication(options) {
        const application = new Application();
        application.playListView.on("selectionchanged", this._playListView_selectionchanged.bind(this));
        application.trackTableView.on("trackchanged", this._trackTableView_selectionchanged.bind(this));
        application.searchView.on("search", this._searchView_search.bind(this));
        application.searchView.on("searchchanged", this._searchView_searchchanged.bind(this));
        application.searchView.$element.find("input").on("focus", this._searchView_focus.bind(this));
        application.searchView.$element.find("input").on("blur", this._searchView_blur.bind(this));
        application.searchListView.on("itemclick", this._searchListView_itemclick.bind(this));
        return application;
    }

    async run() {
        console.log("Net Music Webapp is now running...");

        try {
            await ServiceClient.getInstance().login();

            await this._loadUserPlayLists();

        }
        catch (e) {
            throw new Error("Can't get data.");
        }
    }

    async _loadUserPlayLists() {
        this.playLists = await ServiceClient.getInstance().getUserPlayList();
    }

    _onPlayListsChanged() {
        //console.log(this.playLists);
        this.application.playListView.items = this.playLists;
    }

    _onActivePlayListChanged() {
        if (this.activePlayList) {
            if (this.activePlayList.id) {
                this.application.playListView.showSelection();
                this.application.trackTableView.items = this.activePlayList.tracks;
            }
            else {
                this.application.playListView.hideSelection();
                this.application.trackTableView.items = this.activePlayList;
            }

        }
        else {
            this.trackTableView.items = [];
        }
    }

    _onActiveTrackChanged() {
        this.application.trackPlayerView.activeTrack = this.activeTrack;
    }

    async _playListView_selectionchanged(e) {
        this._showLoading();

        const playList = await ServiceClient.getInstance().getPlayListDetail(this.application.playListView.selectedId);
        this.activePlayList = playList;

        this._hideLoading();
    }

    _trackTableView_selectionchanged(e) {
        if (e.parameters) {
            this.activeTrack = e.parameters;
        }
    }

    async _searchView_search(e) {
        this._showLoading();

        const searchResult = await ServiceClient.getInstance().search(e.parameters.text);
        this.activePlayList = searchResult.songs;

        this._hideLoading();

        this.application.playListView.selection = null;

        this.application.searchListView.hide();
    }

    async _searchView_searchchanged(e) {
        if (e.parameters.text !== "") {
            const suggestion = await ServiceClient.getInstance().search(e.parameters.text, true);
            this.application.searchListView.items = suggestion.songs;
            this.application.searchListView.show();
        }
        else {
            // hide search-list-view
            this.application.searchListView.hide();
        }
    }

    _searchView_focus(e) {
        this.application.searchListView.toggle(this.application.searchView.text && this.application.searchListView.items && this.application.searchListView.items.length > 0);
    }

    _searchView_blur(e) {
        this.application.searchListView.hide();
    }

    async _searchListView_itemclick(e) {
        if (e.parameters.itemName) {
            this._showLoading();

            const searchResult = await ServiceClient.getInstance().search(e.parameters.itemName);
            this.activePlayList = searchResult.songs;

            this._hideLoading();

            this.application.searchView.text = e.parameters.itemName;
        }
    }

    _showLoading() {
        this.application.loadingView.show();
        this.application.trackTableView.hide();
    }

    _hideLoading() {
        this.application.loadingView.hide();
        this.application.trackTableView.show();
    }
}
