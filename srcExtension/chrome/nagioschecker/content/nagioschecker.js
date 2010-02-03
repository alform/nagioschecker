if (!cz) var cz = {};
if (!cz.petrsimek) cz.petrsimek={};

cz.petrsimek.NCH_VERSION = "0.14.9";
cz.petrsimek.NCH_GUID = "{123b2220-59cb-11db-b0de-0800200c9a66}";
cz.petrsimek.NCH_CONFIGFILE="nagioschecker.xml";

cz.petrsimek.nch_branch = "extensions.nagioschecker.";
cz.petrsimek._showTimerID = null;
cz.petrsimek._tab = null;
cz.petrsimek.MAX_SERVERS=200;
cz.petrsimek.ev2pop1 = {
			  'nagioschecker-popup':'nagioschecker-popup',
			  'nagioschecker-popup-down':'nagioschecker-popup-down',
			  'nagioschecker-popup-unreachable':'nagioschecker-popup-unreachable',
			  'nagioschecker-popup-unknown':'nagioschecker-popup-unknown',
			  'nagioschecker-popup-warning':'nagioschecker-popup-warning',
			  'nagioschecker-popup-critical':'nagioschecker-popup-critical',
			  'nagioschecker-panel':'nagioschecker-popup',
			  'nagioschecker-img':'nagioschecker-popup',
			  'nagioschecker-hosts-down':'nagioschecker-popup',
			  'nagioschecker-hosts-unreachable':'nagioschecker-popup',
			  'nagioschecker-services-unknown':'nagioschecker-popup',
			  'nagioschecker-services-warning':'nagioschecker-popup',
			  'nagioschecker-services-critical':'nagioschecker-popup'};

cz.petrsimek.ev2pop2 = {
			  'nagioschecker-popup':'nagioschecker-popup',
			  'nagioschecker-popup-down':'nagioschecker-popup-down',
			  'nagioschecker-popup-unreachable':'nagioschecker-popup-unreachable',
			  'nagioschecker-popup-unknown':'nagioschecker-popup-unknown',
			  'nagioschecker-popup-warning':'nagioschecker-popup-warning',
			  'nagioschecker-popup-critical':'nagioschecker-popup-critical',
			  'nagioschecker-panel':'nagioschecker-popup',
			  'nagioschecker-img':'nagioschecker-popup',
			  'nagioschecker-hosts-down':'nagioschecker-popup-down',
			  'nagioschecker-hosts-unreachable':'nagioschecker-popup-unreachable',
			  'nagioschecker-services-unknown':'nagioschecker-popup-unknown',
			  'nagioschecker-services-warning':'nagioschecker-popup-warning',
			  'nagioschecker-services-critical':'nagioschecker-popup-critical'};
cz.petrsimek.ev2pop=cz.petrsimek.ev2pop1;

cz.petrsimek.isFirst = null;
cz.petrsimek.nagioschecker = null;
cz.petrsimek.nagioscheckerLoad = function() {


	cz.petrsimek.nagioschecker = new NCH();

  Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(cz.petrsimek.nagioschecker, "nagioschecker:preferences-changed", false);



  cz.petrsimek.nagioschecker.start();
};

cz.petrsimek.nagioscheckerUnload = function() {
	
  if (nagioschecker != null) {
    Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .removeObserver(cz.petrsimek.nagioschecker, "nagioschecker:preferences-changed");
    cz.petrsimek.nagioschecker.stop();
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("");
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.cz && win.cz.petrsimek.nagioschecker) {
        win.setTimeout(function() {
          win.cz.petrsimek.nagioschecker.reload(true);          
        },30);

      }

    }
  }
  cz.petrsimek.nagioschecker = null;
}

cz.petrsimek.nagioscheckerBlur = function() {
  if (cz.petrsimek.nagioschecker != null) {
	  cz.petrsimek.nagioschecker.setActive(false);
  }
}
cz.petrsimek.nagioscheckerFocus = function() {
  if (cz.petrsimek.nagioschecker != null) {
	  cz.petrsimek.nagioschecker.setActive(true);
  }
}


function NCH() {};

NCH.prototype = {
	_uid:0,
  bundle: null,
  url: null,
  worktime_from:null,
  worktime_to:null,
  workdays:[],
  _servers:[],
  _serversEnabled:0,
  urlSide: "",
  urlServices: "",
  urlHosts: "",
  urlStatus:"",
  timeoutId: null,
  isStopped:false,
  win:window,
  preferences: Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefBranch),
  oldProblems:{},
  showSb:{},
  filterOutAll:{"down":false,"unreachable":false,"uknown":false,"warning":false,"critical":false},
  soundBT:{},
  parser: null,
  pt:["down","unreachable","unknown","warning","critical"],
  results:null,
  isMoving : false,
  startX : -1,
  startY : -1,
  undockedWindow : null,
  pref:{},
  
  _showTimerID: null,
  _refreshTimer: null,

  isActive: false,
  setActive: function(yes) {
  	dump('ISACTIVE:'+yes+'\n');
  	this.isActive = yes;
  },


  handleMouseClick: function (aEvent) {
	  if(aEvent.button == 0) {
		cz.petrsimek.nagioschecker.abort();
		cz.petrsimek.nagioschecker.handleMouseOver(aEvent);
	  }
  },


  handleMouseOver: function (aEvent) {
	if (cz.petrsimek._showTimerID ) {
		return;
	}
		if ((aEvent.target.id == "nagioschecker-img")||(aEvent.target.id == "nagioschecker-panel")||(aEvent.target.localName == "label")||(aEvent.target.localName == "popup")) {
			if (aEvent.target == cz.petrsimek._tab) {
				return;
			}
			cz.petrsimek._tab = aEvent.target;
			var relPopup=document.getElementById(cz.petrsimek.ev2pop[aEvent.target.id]);
			var callback = function(self) {
			if (relPopup) {
				relPopup.showPopup(cz.petrsimek._tab,  -1, -1, 'popup', 'topleft' , 'bottomleft');
				cz.petrsimek.nagioschecker.openedPops.push(cz.petrsimek.ev2pop[aEvent.target.id]);
			}
		};
		cz.petrsimek._showTimerID = window.setTimeout(callback, 10, this);
	}
  },

  openedPops : [],
  handleMouseOut: function (aEvent) {
	var rel = aEvent.relatedTarget;
	var popupMain = document.getElementById('nagioschecker-popup');
	var popupDown = document.getElementById('nagioschecker-popup-down');
	var popupUnreachable = document.getElementById('nagioschecker-popup-unreachable');
	var popupUnknown = document.getElementById('nagioschecker-popup-unknown');
	var popupCritical = document.getElementById('nagioschecker-popup-critical');
	var popupWarning = document.getElementById('nagioschecker-popup-warning');
	
	if (rel) {
		while (rel) {
			if (rel == cz.petrsimek._tab || rel == popupMain || rel == popupDown || rel == popupUnreachable || rel == popupUnknown || rel == popupCritical || rel == popupWarning)
				return;
			rel = rel.parentNode;
		}
		cz.petrsimek.nagioschecker.abort();
		return;
	}
	var x = aEvent.screenX;
	var y = aEvent.screenY;
	if (cz.petrsimek.nagioschecker.isEntering(x, y, popupMain, true) || cz.petrsimek.nagioschecker.isEntering(x, y, popupDown, true) ||
		cz.petrsimek.nagioschecker.isEntering(x, y, popupUnreachable, true) || cz.petrsimek.nagioschecker.isEntering(x, y, popupUnknown, true) ||	    
		cz.petrsimek.nagioschecker.isEntering(x, y, popupCritical, true) || cz.petrsimek.nagioschecker.isEntering(x, y, popupWarning, true) ||	    
		cz.petrsimek.nagioschecker.isEntering(x, y, cz.petrsimek._tab, true))
		return;
	cz.petrsimek.nagioschecker.abort();   	
  },

  abort: function() {
	if (cz.petrsimek._showTimerID) {
		window.clearTimeout(cz.petrsimek._showTimerID);
		cz.petrsimek._showTimerID = null;
	}
	if (cz.petrsimek._tab) {
		for (var i in cz.petrsimek.nagioschecker.openedPops) {
			if (cz.petrsimek.nagioschecker.openedPops[i])
				document.getElementById(cz.petrsimek.nagioschecker.openedPops[i]).hidePopup();
				
		}
		cz.petrsimek.nagioschecker.openedPops = [];
		
	}
	cz.petrsimek._tab = null;  	
  },
  
  isEntering: function(aScreenX,aScreenY,aElement,aAllowOnEdge) {
	if (aElement) {
	var x = aElement.boxObject.screenX;
	var y = aElement.boxObject.screenY;
	var c = aAllowOnEdge ? 1 : 0;
	if (x < aScreenX - c && aScreenX < x + aElement.boxObject.width + c && 
		y < aScreenY - c && aScreenY < y + aElement.boxObject.height + c) {
		return true;
	}
	}
	return false;   	
  },
  
  _super: null,

  start : function() {
    this.bundle = document.getElementById("nch-strings");
	this._uid = Math.floor(Math.random()*10000);
	this.results=new NCHPaket(this.pref,0);
	
    this.parser = new NCHParser();
    this.setNoData(null);
    try{
      var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
      sound.init();
    }
    catch(e) {}

		var me = this;
		setTimeout(function() {
			me.reload(true,true);
		},1000);
  },

 
  isFirstWindow: function() {
  
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    
    while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win.cz ) {
        	 return (win==window);

        }

      }
    return false;
    
  },

  getFirstWindow: function() {
  
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    
    while(enumerator.hasMoreElements()) {
        var win = enumerator.getNext();
        if (win.cz ) {
        	 return win;

        }

      }
    
    return null;
  },


  stop : function() {
  },


  switchStop: function() {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    var cnt=0;
	var firstWin = null;
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      
      if (win.cz) {
      
      if (cnt==0) {
      	firstWin=win;
      	if (firstWin.cz) {
	    firstWin.cz.petrsimek.nagioschecker.isStopped = (!firstWin.cz.petrsimek.nagioschecker.isStopped);
      	}
      }
      else {
      	if (win.cz.petrsimek.nagioschecker) {
	      	win.cz.petrsimek.nagioschecker.isStopped = firstWin.cz.petrsimek.nagioschecker.isStopped;
      	}
      }
      if (win.document && win.document.getElementById('nagioschecker-stoprun')) {
      	
	    win.document.getElementById('nagioschecker-stoprun').setAttribute("label",(firstWin.cz.petrsimek.nagioschecker.isStopped) ? this.bundle.getString("runagain") : this.bundle.getString("stop"));
      }
      if (win.cz.petrsimek.nagioschecker) {
		win.cz.petrsimek.nagioschecker.resetBehavior();
      }
      cnt++;
      
      }
	}

    this.preferences.setBoolPref("extensions.nagioschecker.stopped",firstWin.cz.petrsimek.nagioschecker.isStopped);
    firstWin.cz.petrsimek.nagioschecker.reload(true);
  },

  reload : function(firstRun,reallyFirstRun) {

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    var cnt=0;
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.cz) {
      win.cz.petrsimek.isFirst = (cnt==0);
	  cnt++;
      }
    }

    this._servers=[];
	this._serversEnabled = 0;

  	this.pref = this.loadPref("extensions.nagioschecker.",{
			sound_warning:['int',0],
			sound_warning_path:['char','chrome://nagioschecker/content/warning.wav'],
			sound_critical:['int',0],
			sound_critical_path:['char','chrome://nagioschecker/content/critical.wav'],
			sound_down:['int',0],
			sound_down_path:['char','chrome://nagioschecker/content/hostdown.wav'],
			stopped:['bool',false],
			timeout:['int',30],
			info_type:['int',0],
			info_window_type:['int',0],
			show_statusbar_down:['bool',true],
			show_statusbar_unreachable:['bool',true],
			show_statusbar_warning:['bool',true],
			show_statusbar_critical:['bool',true],
			show_statusbar_unknown:['bool',true],
			filter_out_all_down:['bool',false],
			filter_out_all_unreachable:['bool',false],
			filter_out_all_warning:['bool',false],
			filter_out_all_critical:['bool',false],
			filter_out_all_unknown:['bool',false],
			sounds_by_type_down:['bool',true],
			sounds_by_type_unreachable:['bool',true],
			sounds_by_type_warning:['bool',true],
			sounds_by_type_critical:['bool',true],
			sounds_by_type_unknown:['bool',true],
			show_window_column_information:['bool',true],
			show_window_column_flags:['bool',false],
			show_window_column_alias:['bool',false],
			show_window_column_attempt:['bool',false],
			show_window_column_status:['bool',true],
			statuses_translation:['int',0],
			filter_out_acknowledged:['bool',true],
			filter_out_disabled_notifications:['bool',true],
			filter_out_disabled_checks:['bool',true],
			filter_out_soft_states:['bool',false],
			filter_out_downtime:['bool',false],
			filter_out_services_on_down_hosts:['bool',false],
			filter_out_services_on_acknowledged_hosts:['bool',false],
			filter_out_regexp_hosts:['bool',false],
			filter_out_regexp_hosts_value:['char',''],
			filter_out_regexp_hosts_reverse:['bool',false],
			filter_out_regexp_services:['bool',false],
			filter_out_regexp_services_value:['char',''],
			filter_out_regexp_services_reverse:['bool',false],
			filter_out_regexp_info:['bool',false],
			filter_out_regexp_info_value:['char',''],
			filter_out_regexp_info_reverse:['bool',false],
			filter_out_flapping:['bool',false],
			refresh:['int',5],
			refreshsec:['int',0],
			worktimefrom:['char','08:00'],
			worktimeto:['char','18:00'],
			play_sound:['int',2],
			play_sound_attempt:['int',1],
			blinking:['int',2],
			click:['int',0],
			one_window_only:['bool',false],
			workday_0:['bool',true],
			workday_1:['bool',true],
			workday_2:['bool',true],
			workday_3:['bool',true],
			workday_4:['bool',true],
			workday_5:['bool',true],
			workday_6:['bool',true],
			prefer_text_config:['bool',false],
			prefer_text_config_type:['int',0]
			},reallyFirstRun);



//	alert(this.pref.play_sound);

	this.workdays = [this.pref.workday_0,this.pref.workday_1,this.pref.workday_2,this.pref.workday_3,this.pref.workday_4,this.pref.workday_5,this.pref.workday_6];


    this.emptyInfo=[];


//alert(this._servers.length);

    this.parser.setServers(this._servers);

	this.isStopped = this.pref.stopped;

    this.parser.setTimeout(this.pref.timeout);

    for (var i in this.pt) {
    	this.filterOutAll[this.pt[i]]=this.pref['filter_out_all_'+this.pt[i]];
    	this.showSb[this.pt[i]]=this.pref['show_statusbar_'+this.pt[i]];
    	this.soundBT[this.pt[i]]=this.pref['sounds_by_type_'+this.pt[i]];
    }

	var sWorktimeFrom = this.pref.worktimefrom;
	while (sWorktimeFrom.length < 5) { // fill up to 5 chars (08:40)
		sWorktimeFrom = "0"+sWorktimeFrom;
	}
	this.worktime_from = ( (sWorktimeFrom.substring(0,2)*60) + (sWorktimeFrom.substring(3,5)*1) )*60;

	var sWorktimeTo = this.pref.worktimeto;
	while (sWorktimeTo.length < 5) { // fill up to 5 chars (08:40)
		sWorktimeTo = "0"+sWorktimeTo;
	}
	this.worktime_to = ( (sWorktimeTo.substring(0,2)*60) + (sWorktimeTo.substring(3,5)*1) )*60;

    document.getElementById('nagioschecker-stoprun').setAttribute("label",(this.isStopped) ? this.bundle.getString("runagain") : this.bundle.getString("stop"));

    var menuMain = document.getElementById('nagioschecker-menu');
    var menuItems = menuMain.childNodes;
    while (menuItems[0].id!="menu-separe") menuMain.removeChild(menuItems[0]);
  
    var separe = document.getElementById('menu-separe');

    var srvlen = this._servers.length;

    if (srvlen>1) {
      var me  = document.createElement("menu");
    	me.setAttribute("label", this.bundle.getString("goto")+" Nagios");    
      var mp1 = document.createElement("menupopup");
      me.appendChild(mp1);
		    menuMain.insertBefore(me,separe);
      var me  = document.createElement("menu");
    	me.setAttribute("label", this.bundle.getString("goto")+" "+this.bundle.getString("services"));    
      var mp2 = document.createElement("menupopup");
      me.appendChild(mp2);
		    menuMain.insertBefore(me,separe);
      var me  = document.createElement("menu");
    	me.setAttribute("label", this.bundle.getString("goto")+" "+this.bundle.getString("hosts"));    
      var mp3 = document.createElement("menupopup");
      me.appendChild(mp3);
		    menuMain.insertBefore(me,separe);
    }
    

      for(var i=0;i<srvlen;i++) {

        var gotoN = document.createElement("menuitem");
        gotoN.setAttribute("label", (srvlen>1) ? this._servers[i].name : this.bundle.getString("goto")+" Nagios");    
        gotoN.setAttribute("oncommand", "cz.petrsimek.nagioschecker.openTab('"+this._servers[i].url+"');");    

        if (srvlen>1) {
          mp1.appendChild(gotoN);
        }
        else {
	  	    menuMain.insertBefore(gotoN,separe);
        }
        var gotoS = document.createElement("menuitem");
        gotoS.setAttribute("label",  (srvlen>1) ? this._servers[i].name : this.bundle.getString("goto")+" "+this.bundle.getString("services"));    
        gotoS.setAttribute("oncommand", "cz.petrsimek.nagioschecker.openTab('"+createNagiosUrl(this._servers[i],'service_problems')+"');");    
        if (srvlen>1) {
          mp2.appendChild(gotoS);
        }
        else {
  		    menuMain.insertBefore(gotoS,separe);
        }

        var gotoH = document.createElement("menuitem");
        gotoH.setAttribute("label",  (srvlen>1) ? this._servers[i].name : this.bundle.getString("goto")+" "+this.bundle.getString("hosts"));    
        gotoH.setAttribute("oncommand", "cz.petrsimek.nagioschecker.openTab('"+createNagiosUrl(this._servers[i],'host_problems')+"');");    
        if (srvlen>1) {
          mp3.appendChild(gotoH);
        }
        else {
  		    menuMain.insertBefore(gotoH,separe);
        }



    }

    if (srvlen==0) {
      separe.setAttribute("hidden","true");
      document.getElementById('nagioschecker-stoprun').setAttribute('hidden','true');
      document.getElementById('nagioschecker-reload').setAttribute('hidden','true');
      document.getElementById('menu-separe2').setAttribute('hidden','true');
    }

//	this.doUpdate();
	this.setNextCheck(true);

  },


	doUpdate: function() {

		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		if (this._servers.length>0) {
			if (!this.isStopped) {
				var firstWin = this.getFirstWindow();
				if ((this.pref.one_window_only) && (firstWin!=window) ) {
//				this.updateAllClients(this.results);
					this.setIcon(window,"disabled");
				}
				else {
					firstWin.cz.petrsimek.nagioschecker.setLoading(true);
//					firstWin.cz.petrsimek.nagioschecker.parser.fetchAllData(cz.petrsimek.nagioschecker,function(probs) {cz.petrsimek.nagioschecker.handleProblems(probs)});
					var me = firstWin.cz.petrsimek.nagioschecker;
					var me2 = this;
					firstWin.cz.petrsimek.nagioschecker.parser.fetchAllData(cz.petrsimek.nagioschecker,function(probs) {
						if (document) {
							me2.enumerateStatus(probs);
							me.updateAllClients(me2.results);
							var reallyPlay=false;

							for(var i=0;i<me.pt.length;i++) {
								dump('me.pt[i]: '+me.pt[i]+' me.soundBT['+me.pt[i]+']:'+me.soundBT[me.pt[i]]+' me.results['+me.pt[i]+'][1]:'+me.results[me.pt[i]][1]+' me.results['+me.pt[i]+'][2]:'+me.results[me.pt[i]][2]+'\n');
								if ( 
									((me.pref.play_sound==1) && (me.soundBT[me.pt[i]]) && me.results.checkServiceAttempt(me.pt[i],me.pref.play_sound_attempt))
									||
									((me.pref.play_sound==2) && (me.soundBT[me.pt[i]]) && me.results.isAtLeastOneByProblemType(me.pt[i]))
								) {
									reallyPlay=true;
								}
							}
							if (reallyPlay) {
								me.playSound(me.results);
							}
							me.setNextCheck();
						}
					});
				}
			}
			else {
				this.updateAllClients(this.results);
      		}
		}
		else {
			this.updateAllClients(null);
		}
	},

  updateAllClients: function(paket) {
  
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    var cnt=0;
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.cz && win.cz.petrsimek.nagioschecker) {
        if (!this.isStopped) {        
          if ((this.pref.one_window_only) && (!win.cz.petrsimek.isFirst) ) {
          	win.cz.petrsimek.nagioschecker.setNoData("");
            win.cz.petrsimek.nagioschecker.setIcon(win,"disabled");
          }
          else {
            if (paket==null) {
              win.cz.petrsimek.nagioschecker.setNoData("notSet");
            }
            else {
              win.cz.petrsimek.nagioschecker.updateStatus(paket,false);
            }
          }
        }
        else {
          win.cz.petrsimek.nagioschecker.setNoData("");
          win.cz.petrsimek.nagioschecker.setIcon(win,"stop");
          win.cz.petrsimek.nagioschecker.resetBehavior();
        }
        cnt++;
      }
    }

  },

  

	createUrlDevice: function(i,host,service) {
	  	return createNagiosUrl(this._servers[i],'detail',host,service);
	},

  // plan next check
  setNextCheck: function(instant){
  	var refresh_time = (instant == null) ? this.pref.refresh*60000+this.pref.refreshsec*1000 : 500;
  
	var me = this;
	this.timeoutId = setTimeout(
			function() {
				if (me.isCheckingTime()) {
					me.setIcon(window,"loading");
					me.doUpdate();
				} else {
					me.setNextCheck();
					me.setIcon(window,"sleepy");
				}
			}
			, refresh_time
		);
  },



  observe : function(subject, topic, data) {
  	if (topic == "nagioschecker:preferences-changed") {
  		
		try {
			var preferFileType = this.preferences.getIntPref('extensions.nagioschecker.prefer_text_config_type');
		}
		catch (e) {
			var preferFileType = false;
		}
	

  	if (preferFileType!=0) { 		
  		
    try {
		var nch_branch = this.preferences.getBranch('extensions.nagioschecker.');
		var childs = nch_branch.getChildList("", {});
		
		var doc = document.implementation.createDocument("", "", null);
		var root = doc.createElement('preferences');
		root.setAttribute('branch', 'extensions.nagioschecker.');
		for(var i in childs) {
			var item = doc.createElement('pref');
			item.setAttribute('name', childs[i]);
		
			switch (nch_branch.getPrefType(childs[i])) {
				case nch_branch.PREF_STRING:
					item.setAttribute('type', 'string');
					item.setAttribute('value',nch_branch.getCharPref(childs[i]));
					break;
				case nch_branch.PREF_INT:
					item.setAttribute('type', 'int');
					item.setAttribute('value', nch_branch.getIntPref(childs[i]));
					break;
				case nch_branch.PREF_BOOL:
					item.setAttribute('type', 'bool');
					item.setAttribute('value', nch_branch.getBoolPref(childs[i]));
					break;
			}
			root.appendChild(item);			
		}
		doc.appendChild(root);
    }
    catch (e) {
		alert(e);
    }

	try {
		var serializer = new XMLSerializer();
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
               .createInstance(Components.interfaces.nsIFileOutputStream);
		
		if (preferFileType==1) {
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
			                              .getService(Components.interfaces.nsIProperties)
			                              .get("ProfD", Components.interfaces.nsIFile);
			file.append("extensions");
			file.append(cz.petrsimek.NCH_GUID);
			file.append(cz.petrsimek.NCH_CONFIGFILE);
		}
		else if (preferFileType==2) {
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
			                             	.getService(Components.interfaces.nsIProperties)
			                             	.get("DefProfRt", Components.interfaces.nsIFile); // get profile folder
			file.append(cz.petrsimek.NCH_CONFIGFILE);
		}
		
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
		serializer.serializeToStream(doc, foStream, "");
		foStream.close();			
    }
    catch (e) {
		alert(e);
    }
  	
  	
  	}
  	
  		setTimeout("if (cz.petrsimek.nagioschecker != null) cz.petrsimek.nagioschecker.reload(false);", 300);
  	}
  },

  openAllTabs: function(what) {
		      for(var i = 0;i<this._servers.length;i++) {
		        switch (what) {
		          case "hosts":
                if ((this.results["down"][3][i]>0) || (this.results["unreachable"][3][i]>0)) {
		              this.openTab(createNagiosUrl(this._servers[i],'host_problems'));
                }
		          break;
          		 case "services":
                if ((this.results["critical"][3][i]>0) || (this.results["warning"][3][i]>0) || (this.results["unknown"][3][i]>0)) {
						      this.openTab(createNagiosUrl(this._servers[i],'service_problems'));
                }
            	 break;
          		 default:
            		this.openTab(this._servers[i].url);
            	 break;
        		  }	
	   		}
  },

  hideNchPopup: function(popupId) {
		document.getElementById(popupId).hidePopup();
  },

  statusBarOnClick: function(event,what) {
    if ((event.button==0) && (this.pref.click)) {
      this.openAllTabs(what);
    }
  },

  urlOpened: function(url) {
      var found = false;
      try {
	      var b = window.getBrowser();
	      var br = b.browsers;
	      if (br == undefined) 
		      return false;
      }
      catch (e) {
		return false;
      }
      for (var i=0;i<br.length;i++) {
        var nsu = br[i].currentURI;
        if (nsu) {
          var eurl=nsu.prePath+nsu.path;
          if (eurl==url) {
          	found=b.tabContainer.childNodes[i];
          }
        }
      }
    return found;
  },

  openTab: function(url) {
      var foundTab = this.urlOpened(url);
      if (!foundTab) {
      	try {
	      	var br = window.getBrowser().browsers;
      	}
      	catch (e) {
      		var br = undefined;
      	}
		if (br != undefined) {
			window.getBrowser().selectedTab = window.getBrowser().addTab(url);
		} else {
			var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
			uri.spec = url;
			var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"].getService(Components.interfaces.nsIExternalProtocolService);
			protocolSvc.loadUrl(uri);
		}       	    	
      }
      else {
      	window.getBrowser().selectedTab = foundTab;        
      }
  },

  goToUrl:function(event, url) {
  	window.getBrowser().selectedTab = window.getBrowser().addTab(url);
  },

  getCorrectBundleString: function(num,part_bundle_id,fake_num) {
	  
	var useEnglish = (cz.petrsimek.nagioschecker.pref.statuses_translation==1);
	var real_num = (fake_num) ? fake_num : num;
	   var english = {
			   "alertDown1":"down",
			   "alertDown2to4":"down",
			   "alertDown5more":"down",
			   "alertUnreachable1":"unreachable",
			   "alertUnreachable2to4":"unreachable",
			   "alertUnreachable5more":"unreachable",
			   "alertWarning1":"warning",
			   "alertWarning2to4":"warnings",
			   "alertWarning5more":"warnings",
			   "alertCritical1":"critical",
			   "alertCritical2to4":"critical",
			   "alertCritical5more":"critical",
			   "alertUnknown1":"unknown",
			   "alertUnknown2to4":"unknown",
			   "alertUnknown5more":"unknown",
			   "shortAlertDown1":real_num+" down",
			   "shortAlertDown2to4":real_num+" down",
			   "shortAlertDown5more":real_num+" down",
			   "shortAlertUnreachable1":real_num+" unreachable",
			   "shortAlertUnreachable2to4":real_num+" unreachable",
			   "shortAlertUnreachable5more":real_num+" unreachable",
			   "shortAlertWarning1":real_num+" warning",
			   "shortAlertWarning2to4":real_num+" warnings",
			   "shortAlertWarning5more":real_num+" warnings",
			   "shortAlertCritical1":real_num+" critical",
			   "shortAlertCritical2to4":real_num+" critical",
			   "shortAlertCritical5more":real_num+" critical",
			   "shortAlertUnknown1":real_num+" unknown",
			   "shortAlertUnknown2to4":real_num+" unknown",
			   "shortAlertUnknown5more":real_num+" unknown",
			   "fullAlertDown1":real_num+" host down",
			   "fullAlertDown2to4":real_num+" hosts down",
			   "fullAlertDown5more":real_num+" hosts down",
			   "fullAlertUnreachable1":real_num+" host unreachable",
			   "fullAlertUnreachable2to4":real_num+" hosts unreachable",
			   "fullAlertUnreachable5more":real_num+" hosts unreachable",
			   "fullAlertWarning1":real_num+" service warning",
			   "fullAlertWarning2to4":real_num+" service warnings",
			   "fullAlertWarning5more":real_num+" service warnings",
			   "fullAlertCritical1":real_num+" critical service",
			   "fullAlertCritical2to4":real_num+" critical services",
			   "fullAlertCritical5more":real_num+" critical services",
			   "fullAlertUnknown1":real_num+" unknown service",
			   "fullAlertUnknown2to4":real_num+" unknown services",
			   "fullAlertUnknown5more":real_num+" unknown services",
			   "error1":real_num+" error",
			   "error2to4":real_num+" errors",
			   "error5more":real_num+" errors"
	   };

	  
  
    if (part_bundle_id=="") {
      return (fake_num) ? fake_num : "  "+num+"  ";
    }
    else {
    if (num==1) {
      return (useEnglish) ? english[part_bundle_id+"1"] : this.bundle.getFormattedString(part_bundle_id+"1",[(fake_num) ? fake_num : num])
    }
    else if ((num>=2) && (num<=4)) {
      return (useEnglish) ? english[part_bundle_id+"2to4"] : this.bundle.getFormattedString(part_bundle_id+"2to4",[(fake_num) ? fake_num : num])
    }
    else if (num>=5) {
      return (useEnglish) ? english[part_bundle_id+"5more"] : this.bundle.getFormattedString(part_bundle_id+"5more",[(fake_num) ? fake_num : num])
    }
    else {
      return "";
    }
    }
  },


  enumerateStatus: function(problems) {
	var paket = new NCHPaket(this.pref,0);

    var newProblems={};
    for(var i=0;i<problems.length;i++) {
		paket.addTooltipHeader('all',this._servers[i].name,i,problems[i]["_time"]);
        if (problems[i]["_error"]) {
			paket.addError('all');
        }

        var st = null;
		var isNotUp = {};
		var isAck = {};
		    var isSched = {};

		for(var x=0;x<this.pt.length;x++) {
		
			var probls = (problems[i]["_error"]) ? null : problems[i][this.pt[x]];

			if (((probls) && (probls.length)) || (!probls)){
				paket.addTooltipHeader(this.pt[x],this._servers[i].name,i);
			}		  	

			if (!probls) {
				paket.addError(this.pt[x]);
			}
			else {
				st=this.pt[x];

				for (var j =0;j<probls.length;j++) {
					if (
						 (!this.filterOutAll[st])
					    &&
						 ((!probls[j].acknowledged) || ((probls[j].acknowledged) && (!this.pref.filter_out_acknowledged))) 
					    &&
					    ((!probls[j].dischecks) || ((probls[j].dischecks) && (!this.pref.filter_out_disabled_checks))) 
					    &&
					    ((!probls[j].disnotifs) || ((probls[j].disnotifs) && (!this.pref.filter_out_disabled_notifications)))
					    &&
					    ((!this.pref.filter_out_downtime) || ((this.pref.filter_out_downtime) && 
					            (
					    		((!probls[j].service) && (!probls[j].downtime))
				    			|| 
					    		((probls[j].service) && (!probls[j].downtime) && (!isSched[probls[j].host]))
					    		)))

					    &&
					    ((!probls[j].flapping) || ((probls[j].flapping) && (!this.pref.filter_out_flapping)))
    			    	 &&
		    			 ((!probls[j].isSoft) || ((probls[j].isSoft) && ((!this.pref.filter_out_soft_states) || (isNotUp[probls[j].host]))))
					    &&
					    ((!this.pref.filter_out_services_on_down_hosts) || ((this.pref.filter_out_services_on_down_hosts) && ((!probls[j].service) || ((probls[j].service) && (!isNotUp[probls[j].host])))))
					    &&
					    ((!this.pref.filter_out_services_on_acknowledged_hosts) || ((this.pref.filter_out_services_on_acknowledged_hosts) && ((!probls[j].service) || ((probls[j].service) && (!isAck[probls[j].host])))))
					    &&
					    (
					    	(!this.pref.filter_out_regexp_hosts) 
					    	|| 
					    	(
					    		(this.pref.filter_out_regexp_hosts) 
					    		&& 
					    		(probls[j].host) 
					    		&&  
					    		(
					    			(
					    				(!this.pref.filter_out_regexp_hosts_reverse) 
					    				&& 
					    				(!probls[j].host.match(new RegExp(this.pref.filter_out_regexp_hosts_value)))
					    			) 
					    			|| 
					    			(
					    				(this.pref.filter_out_regexp_hosts_reverse) 
					    				&& 
					    				(probls[j].host.match(new RegExp(this.pref.filter_out_regexp_hosts_value)))
					    			)
					    		)
					    	)
					    )
					    &&
					    (
					    	(!this.pref.filter_out_regexp_services)
					    	||
					    	(
					    		(this.pref.filter_out_regexp_services)
					    		&&
					    		(
					    			(!probls[j].service)
					    			||
						    		(
						    			(probls[j].service)
							    		&&
							    		(
							    			(
							    				(!this.pref.filter_out_regexp_services_reverse)
							    				&&
							    				(!probls[j].service.match(new RegExp(this.pref.filter_out_regexp_services_value)))
							    			)
							    			||
							    			(
							    				(this.pref.filter_out_regexp_services_reverse)
							    				&&
							    				(probls[j].service.match(new RegExp(this.pref.filter_out_regexp_services_value)))
							    			)
							    		)
							    	)
							    )
						    )
					    )

					    &&
					    (
					    	(!this.pref.filter_out_regexp_info) 
					    	|| 
					    	(
					    		(this.pref.filter_out_regexp_info) 
					    		&& 
					    		(probls[j].info) 
					    		&&  
					    		(
					    			(
					    				(!this.pref.filter_out_regexp_info_reverse) 
					    				&& 
					    				(!probls[j].info.match(new RegExp(this.pref.filter_out_regexp_info_value)))
					    			) 
					    			|| 
					    			(
					    				(this.pref.filter_out_regexp_info_reverse) 
					    				&& 
					    				(probls[j].info.match(new RegExp(this.pref.filter_out_regexp_info_value)))
					    			)
					    		)
					    	)
					    )
					    
					    ) {
							var uniq = this._servers[i].name+"-"+probls[j].host+"-"+probls[j].service+"-"+probls[j].status;
							newProblems[uniq]=probls[j];
							paket.addProblem(i,this.pt[x],this.oldProblems[uniq],probls[j],this._servers[i].aliases[probls[j].host]);
				    }
					if ((this.pt[x]=="down") || (this.pt[x]=="unreachable")) {
						isNotUp[probls[j].host]=true;
					    if (probls[j].acknowledged) {
						    isAck[probls[j].host]=true;
					    }
					    if (probls[j].downtime) {
						    isSched[probls[j].host]=true;
					    }
				    }
			    }
			}
	    }
    }

    this.oldProblems=newProblems;
    this.results = paket;

  },


  resetBehavior: function() {

	var alertCount = (this.results['all']) ? this.results['all'][1] : 0;

    var fld = {
              "down":document.getElementById('nagioschecker-hosts-down'),
              "unreachable": document.getElementById('nagioschecker-hosts-unreachable'),
  	          "unknown": document.getElementById('nagioschecker-services-unknown'),
  	          "warning": document.getElementById('nagioschecker-services-warning'),
  	          "critical": document.getElementById('nagioschecker-services-critical')
              };


    var mainPanel=document.getElementById('nagioschecker-panel');
    var mainPopup=document.getElementById('nagioschecker-popup');
    cz.petrsimek.ev2pop=cz.petrsimek.ev2pop1;

    switch (this.pref.click) {
		  case 1:
			  mainPanel.setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'main');");
			  break;
		  case 5:
			  mainPanel.setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'services');");
			  break;
		  case 6:
			  mainPanel.setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'hosts');");
			  break;
		  case 3:
			if (!this.isStopped) {

			if (this.pref.info_type==6) {
				var ico = document.getElementById('nagioschecker-img');
				ico.addEventListener('click',cz.petrsimek.nagioschecker.handleMouseClick,false);
				ico.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
				ico.relatedTarget='nagioschecker-popup';
			}

				mainPanel.addEventListener('click',cz.petrsimek.nagioschecker.handleMouseClick,false);
		  mainPanel.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
		  mainPanel.relatedPopup='nagioschecker-popup';

			}
			else {
			  	mainPanel.setAttribute("onclick","void(0);");
			}
			  break;
		  default:
			  	mainPanel.setAttribute("onclick","void(0);");
			  break;		
	  }
	  if (this.pref.click>0) {
		mainPanel.setAttribute("style","cursor:pointer");
    	for (var pType in fld) {
	      fld[pType].setAttribute("style","cursor:pointer");
	    }
	  }

	  if (this.pref.click==2){
	      for (var pType in fld) {
	        fld[pType].setAttribute("style","cursor:pointer");
	      }
	  	  fld["down"].setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'hosts');");
	  	  fld["unreachable"].setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'hosts');");
	  	  fld["unknown"].setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'services');");
	  	  fld["warning"].setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'services');");
	  	  fld["critical"].setAttribute("onclick","cz.petrsimek.nagioschecker.statusBarOnClick(event,'services');");
	  }
	  else {
	      if ((this.pref.click==4) && (!this.isStopped)) {

			if (this.pref.info_type==6) {
				var ico = document.getElementById('nagioschecker-img');
				ico.addEventListener('click',cz.petrsimek.nagioschecker.handleMouseClick,false);
				ico.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
				ico.relatedTarget='nagioschecker-popup';
			}
			else {
	    	    for (var pType in fld) {
		          fld[pType].setAttribute("style","cursor:pointer");

				  var pop = document.getElementById('nagioschecker-popup-'+pType);
				  pop.addEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
				  pop.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
	
				  fld[pType].addEventListener('click',cz.petrsimek.nagioschecker.handleMouseClick,false);
				  fld[pType].addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
				  fld[pType].relatedTarget='nagioschecker-popup-'+pType;

		        }
			}
	      }
	      else {
	        for (var pType in fld) {
			  	fld[pType].setAttribute("onclick","void(0);");


	        }
	      }
	  }


	mainPopup.addEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
	mainPopup.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);

	  mainPanel.removeEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
	  mainPanel.removeEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);

      for (var pType in fld) {
		  var pop = document.getElementById('nagioschecker-popup-'+pType);
		  pop.addEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
		  pop.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
		  fld[pType].removeEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
		  fld[pType].removeEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
      }

    if ((alertCount>0) && (this.pref.info_window_type>0) && (!this.isStopped) && ((!this.pref.one_window_only) || ((this.pref.one_window_only) && (this.isFirstWindow()))))  {
      if (this.pref.info_window_type==1) {
		  mainPanel.addEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
		  mainPanel.addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
		  mainPanel.relatedPopup='nagioschecker-popup';
      }
      else {		  
    	  cz.petrsimek.ev2pop=cz.petrsimek.ev2pop2;
        for (var pType in fld) {
		  fld[pType].addEventListener('mouseover',cz.petrsimek.nagioschecker.handleMouseOver,false);
		  fld[pType].addEventListener('mouseout',cz.petrsimek.nagioschecker.handleMouseOut,false);
		  fld[pType].relatedTarget='nagioschecker-popup-'+pType;
        }
      }
    }

  },



  updateStatus: function(paket,firstRun) {

	if (paket) paket.createTooltip(window);


	this.resetBehavior();

	var countErrors = paket.getCountErrors();
	var fldErrors = document.getElementById('nagioschecker-errors');
	var showLong = (this.pref.info_type==0 || this.pref.info_type==1 || this.pref.info_type==3);
	if (countErrors>0) {
		fldErrors.setAttribute("value",(showLong) ? countErrors+" "+this.getCorrectBundleString(countErrors,"error","") : "! "+countErrors);
	}
	fldErrors.setAttribute("hidden",(countErrors==0));
	
	
    var fld = {
              "down":document.getElementById('nagioschecker-hosts-down'),
	           	"unreachable": document.getElementById('nagioschecker-hosts-unreachable'),
  	          "unknown": document.getElementById('nagioschecker-services-unknown'),
  	          "warning": document.getElementById('nagioschecker-services-warning'),
  	          "critical": document.getElementById('nagioschecker-services-critical')
              };

    var infoTypes = {
          "down":["fullAlertDown","shortAlertDown",""],
          "unreachable":["fullAlertUnreachable","shortAlertUnreachable",""],
          "unknown":["fullAlertUnknown","shortAlertUnknown",""],
          "warning":["fullAlertWarning","shortAlertWarning",""],
          "critical":["fullAlertCritical","shortAlertCritical",""]
          };
	if (this.pref.info_type==6) {
		var img_cls = "";
		if (paket.countProblemsByType("warning")>0) img_cls = "nagioschecker-warning-image";
		if (paket.countProblemsByType("unknown")>0) img_cls = "nagioschecker-unknown-image";
		if (paket.countProblemsByType("critical")>0) img_cls = "nagioschecker-critical-image";
		if (paket.countProblemsByType("unreachable")>0) img_cls = "nagioschecker-unreachable-image";
		if (paket.countProblemsByType("down")>0) img_cls = "nagioschecker-down-image";
		document.getElementById('nagioschecker-img').setAttribute("class",img_cls);
	}
    else if (this.pref.info_type>2) {
      for (var pType in fld) {
        var x = "";
        var pbt = paket.getProblemsByType(pType);
        for (var i = 0; i < pbt.length; i++) {
          if (pbt[i]>0) {
              x+=((x) ? " + " : "")+((this.pref.info_type<5) ? this._servers[i].name+' ' : '')+pbt[i];
          }
        }
    	  fld[pType].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType(pType),infoTypes[pType][(this.infoType==3) ? 1 : 2],x));
      }
		document.getElementById('nagioschecker-img').setAttribute("class","");

    }
    else {
    	fld["down"].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType("down"),infoTypes["down"][this.pref.info_type],""));
  	  fld["unreachable"].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType("unreachable"),infoTypes["unreachable"][this.pref.info_type],""));
		  fld["unknown"].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType("unknown"),infoTypes["unknown"][this.pref.info_type],""));
		  fld["warning"].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType("warning"),infoTypes["warning"][this.pref.info_type],""));
		  fld["critical"].setAttribute("value", this.getCorrectBundleString(paket.countProblemsByType("critical"),infoTypes["critical"][this.pref.info_type],""));
		document.getElementById('nagioschecker-img').setAttribute("class","");
    }

    fld["down"].setAttribute("hidden", (((paket.countProblemsByType("down")==0) || (!this.showSb["down"]) || (this.pref.info_type==6)) ? "true" : "false"));
    fld["unreachable"].setAttribute("hidden", (((paket.countProblemsByType("unreachable")==0) || (!this.showSb["unreachable"]) || (this.pref.info_type==6)) ? "true" : "false"));
    fld["unknown"].setAttribute("hidden", (((paket.countProblemsByType("unknown")==0) || (!this.showSb["unknown"]) || (this.pref.info_type==6)) ? "true" : "false"));
    fld["warning"].setAttribute("hidden", (((paket.countProblemsByType("warning")==0) || (!this.showSb["warning"]) || (this.pref.info_type==6)) ? "true" : "false"));
    fld["critical"].setAttribute("hidden", (((paket.countProblemsByType("critical")==0) || (!this.showSb["critical"]) || (this.pref.info_type==6)) ? "true" : "false"));

    document.getElementById('nagioschecker-info-label').setAttribute("hidden", "true");

    this.setLoading(false);

    if (paket.countProblemsByType("all")>0) {

      var whichBlink = {};      

      for (var pType in fld) {
        whichBlink[pType]=((paket.countOldProblemsByType(pType)>0) || (this.pref.blinking==2)) ? true : false;
      }

      if ((this.pref.blinking==3) || (this.pref.blinking==2) || ((this.pref.blinking==1) && (paket.countOldProblemsByType("all")>0)) && (!firstRun)){
        this.blinkLabel(12,whichBlink);
      }
    }
    else {
      if (paket.isError) {
        this.setNoData("error");
      }
      else {
        this.setNoData((this._serversEnabled>0) ? "noProblem" : "notSet");
      }
    }
    

  },


 blinkLabel: function(numberofblinks,bl) {
  try {
		var labelIds = [
			["nagioschecker-hosts-down","nagioschecker-down-value","nagioschecker-down-value-inverted","down"],
			["nagioschecker-hosts-unreachable","nagioschecker-unreachable-value","nagioschecker-unreachable-value-inverted","unreachable"],
			["nagioschecker-services-unknown","nagioschecker-unknown-value","nagioschecker-unknown-value-inverted","unknown"],
			["nagioschecker-services-critical","nagioschecker-critical-value","nagioschecker-critical-value-inverted","critical"],
			["nagioschecker-services-warning","nagioschecker-warning-value","nagioschecker-warning-value-inverted","warning"]
			];
	  if (numberofblinks > 0) {
		for(var i=0;i<labelIds.length;i++) {	

      if (bl[labelIds[i][3]]) {
  		  var label = document.getElementById(labelIds[i][0]);
	     label.setAttribute("class",(label.getAttribute("class") == labelIds[i][1]) ? labelIds[i][2] : labelIds[i][1]);
      }

		}
      numberofblinks--;
      var me=this;
      setTimeout(function() {
          me.blinkLabel(numberofblinks,bl);
          }, 300);
	  }
	  else {
		for(var i=0;i<labelIds.length;i++) {	
		  var label = document.getElementById(labelIds[i][0]);
	      label.setAttribute("class",labelIds[i][1]);
		}
     }
  }
  catch (e) {
    dump(e);
  }
  },



 playSound: function(paket) {
	var wav = null;
	if (paket.countProblemsByType("down")>0) {
		wav = (this.pref.sound_down==0) ? "chrome://nagioschecker/content/hostdown.wav" : "file:///"+this.pref.sound_down_path;
	}
	else if (paket.countProblemsByType("critical")>0) {
		wav = (this.pref.sound_critical==0) ? "chrome://nagioschecker/content/critical.wav" : "file:///"+this.pref.sound_critical_path;
	}
	else if (paket.countProblemsByType("warning")>0) {
		wav = (this.pref.sound_warning==0) ? "chrome://nagioschecker/content/warning.wav" : "file:///"+this.pref.sound_warning_path;
	}
	if (wav!=null) {
    try {
      var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
          var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
          var soundUri = ioService.newURI(wav, null, null);
      sound.play(soundUri);
    }
    catch(e) {
		dump(e);
    }
	}
  },

 setNoData: function(type) {
	this.setLoading(false);
 	document.getElementById('nagioschecker-hosts-down').setAttribute("hidden", "true");
 	document.getElementById('nagioschecker-hosts-unreachable').setAttribute("hidden", "true");
 	document.getElementById('nagioschecker-services-unknown').setAttribute("hidden", "true");
 	document.getElementById('nagioschecker-services-warning').setAttribute("hidden", "true");
 	document.getElementById('nagioschecker-services-critical').setAttribute("hidden", "true");

	if (type) {
    	var infoLabel = document.getElementById('nagioschecker-info-label');
	    infoLabel.setAttribute("hidden", "false");
    	if (type=="notSet") {
			infoLabel.setAttribute("class", "nagioschecker-notset-value");
      		infoLabel.removeAttribute("tooltip");
      
      		var ico = document.getElementById('nagioschecker-img');
      		ico.removeAttribute("tooltip");

      		var mainPanel=document.getElementById('nagioschecker-panel');
      		mainPanel.removeAttribute("onclick");

    		infoLabel.setAttribute("value",cz.petrsimek.nagioschecker.bundle.getString(type));
    	
    	}
    	else if (type=="noProblem") {

      		var ico = document.getElementById('nagioschecker-img');
      		ico.removeAttribute("tooltip");

      		var mainPanel=document.getElementById('nagioschecker-panel');
      		mainPanel.removeAttribute("onclick");

	  		if (this.pref.info_type==6) {
				ico.setAttribute("class","nagioschecker-allok-image");
	    		infoLabel.setAttribute("hidden", "true");
	  		}
	  		else {
	      		infoLabel.setAttribute("class", "nagioschecker-allok-value");
	      		infoLabel.removeAttribute("tooltip");
		  		if ((this.pref.info_type==2) || (this.pref.info_type==5)) {
		    		infoLabel.setAttribute("value"," 0 ");
		  		}
		  		else {
		    		infoLabel.setAttribute("value",cz.petrsimek.nagioschecker.bundle.getString(type));
		  		}
	  		}
    	}
		else {
	  		if (type=="error") {
	  			infoLabel.setAttribute("class", "nagioschecker-notset-value");
	  		}
	  		infoLabel.setAttribute("value",(type) ? cz.petrsimek.nagioschecker.bundle.getString(type) : "");
		}
  	}
 },

  setLoading: function(loading) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
    var browserWindow = wm.getMostRecentWindow("navigator:browser");
    var enumerator = wm.getEnumerator("");
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win.cz && win.cz.petrsimek.nagioschecker) {
			win.cz.petrsimek.nagioschecker.setIcon(window,(loading) ? "loading" : ((win.cz.petrsimek.nagioschecker.isStopped) ? "stop" : "nagios"));
			win.cz.petrsimek.nagioschecker.resetBehavior();
      }
    }
  },

  setIcon: function(w,type) {
    var ico = w.document.getElementById('nagioschecker-img');
	if (type!="nagios") ico.setAttribute("class","");
	switch (type) {
		case "loading":
			ico.setAttribute("src","chrome://nagioschecker/skin/Throbber.gif");
		    ico.removeAttribute("tooltiptext");
			break;
		case "nagios":
			ico.setAttribute("src","chrome://nagioschecker/skin/nagios16.png");
		    ico.removeAttribute("tooltiptext");
			break;
		case "sleepy":
			ico.setAttribute("src","chrome://nagioschecker/skin/nagiosZzz.png");
		    ico.removeAttribute("tooltiptext");
			break;
		case "disabled":
			ico.setAttribute("src","chrome://nagioschecker/skin/nag-disabled.png");
		    ico.setAttribute("tooltiptext",cz.petrsimek.nagioschecker.bundle.getString("disabledRun"));
			break;
		case "stop":
			ico.setAttribute("src","chrome://nagioschecker/skin/nag-stop.png");
		    ico.setAttribute("tooltiptext",cz.petrsimek.nagioschecker.bundle.getString("stoppedRun"));
			break;
	}


  },

  // retrive actual time and workingtime then calculate whether or not check Nagios status
  // sets sleepy icon
  isCheckingTime: function() {
	var bRet = false;
	var now = (new Date()).getTime() / 1000; // actual tim in sec
	now = now - (new Date()).getTimezoneOffset()*60; // TZ offset
	now = Math.round(now % 86400); // atual hour in sec (without date information)
	if (this.worktime_from > this.worktime_to) {
		this.worktime_from -= 24*60*60;
	}
	var tDay = (new Date).getDay();
	bRet = (now > this.worktime_from) && (now < this.worktime_to) && (this.workdays[tDay]);
	return bRet;
  },
  
	loadPref: function(branch,conf,firstRun) {

		var result = {};
    var pm = new  NCHPass();

		try {
			var preferFileType = this.preferences.getIntPref('extensions.nagioschecker.prefer_text_config_type');
		}
		catch (e) {
			var preferFileType = false;
		}
	
		if((preferFileType!=0) && (firstRun)) {		

			var xml = "";
			
			if (preferFileType==1) {
			
				var file = Components.classes["@mozilla.org/file/directory_service;1"]
				                              .getService(Components.interfaces.nsIProperties)
				                              .get("ProfD", Components.interfaces.nsIFile); // get profile folder
				file.append("extensions");
				file.append(cz.petrsimek.NCH_GUID);
				file.append(cz.petrsimek.NCH_CONFIGFILE);
			}
			else if (preferFileType==2) {
				var file = Components.classes["@mozilla.org/file/directory_service;1"]
				                             	.getService(Components.interfaces.nsIProperties)
				                             	.get("DefProfRt", Components.interfaces.nsIFile); // get profile folder
				                  			
				file.append(cz.petrsimek.NCH_CONFIGFILE);
				
			}
		
		
		}
		
		if((preferFileType!=0) && (firstRun) && (file.exists())) {		

			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                        .createInstance(Components.interfaces.nsIScriptableInputStream);

			fstream.init(file, -1, 0, 0);
			sstream.init(fstream); 
			var str = sstream.read(4096);
			while (str.length > 0) {
	  			xml += str;
  				str = sstream.read(4096);
			}
			sstream.close();
			fstream.close();
			var domParser = new DOMParser();
			var dom = domParser.parseFromString(xml, "text/xml");
	
			var prfs = dom.getElementsByTagName("pref");
		
			var tmp_prf  = {};
			for (var i = 0; i < prfs.length; i++) {
				switch(prfs[i].getAttribute('type')) {
					case 'bool':
						tmp_prf[prfs[i].getAttribute('name')]=(prfs[i].getAttribute('value')=='true') ? true : false;	
						break;
					case 'int':
						tmp_prf[prfs[i].getAttribute('name')]=parseInt(prfs[i].getAttribute('value'));	
						break;
					default:
						tmp_prf[prfs[i].getAttribute('name')]=(prfs[i].getAttribute('value')) ? prfs[i].getAttribute('value') : '';	
						break;						
				}
				
			}
			for (var i in conf) {
				if (tmp_prf[i]!=undefined) {
					result[i] = tmp_prf[i]; 
					if ((conf[i][0]=='char') && (result[i]=='') && (conf[i][1]!='') ){
							result[i]=conf[i][1];
					}
				
				}
				else {
					result[i] = conf[i][1];
				}
			}
			
			
      for(var i=0;i<cz.petrsimek.MAX_SERVERS;i++) {
        
        var surl = tmp_prf[(i+1)+".url"];
        if (surl) {
       	  	var pPass = tmp_prf[(i+1)+".plainpass"];
       		var gAli = tmp_prf[(i+1)+".getaliases"];
       		var gDis = tmp_prf[(i+1)+".disabled"];
        	
          	var auth = pm.getAuth((i+1));
          	this._servers.push({
                  url:surl,
                  name:tmp_prf[(i+1)+".name"],
                  urlstatus:tmp_prf[(i+1)+".urlstatus"],
                  username:(pPass) ? tmp_prf[(i+1)+".username"] : ((auth.user) ? auth.user : ''),
                  password:(pPass) ? tmp_prf[(i+1)+".password"] : ((auth.password) ? auth.password : ''),
                  versionOlderThan20:tmp_prf[(i+1)+".vot20"],
                  serverType: tmp_prf[(i+1)+".servertype"],
                  getAliases:gAli,
                  aliases:{},
                  disabled:gDis
                  });
		   	if (!gDis) this._serversEnabled++;
           
		}
      }
			
			
		}
		else {		
			for (var i in conf) {
				try {
					switch (conf[i][0]) {
						case 'int':
							result[i] = this.preferences.getIntPref(branch+i);
							break;
						case 'bool':
							result[i] = this.preferences.getBoolPref(branch+i);
							break;
						case 'char':
							result[i] = this.preferences.getCharPref(branch+i);
							if ((result[i]=='') && (conf[i][1]!='')) {
								result[i]=conf[i][1];
							}
							break;
					}
	      		}
	      		catch(e) {
					result[i] = conf[i][1];
	      		}
			}
			
			


    try {


      for(var i=0;i<cz.petrsimek.MAX_SERVERS;i++) {
        
        var surl = this.preferences.getCharPref("extensions.nagioschecker."+(i+1)+".url");
        if (surl) {
	        try {
        	  	var pPass = this.preferences.getBoolPref("extensions.nagioschecker."+(i+1)+".plainpass");
        	}
        	catch (e2) {
	          	var pPass=false;
        	}
        	try {
          		var gAli = this.preferences.getBoolPref("extensions.nagioschecker."+(i+1)+".getaliases");
        	}
        	catch (e2) {
          		var gAli=false;
        	}
        	try {
          		var gDis = this.preferences.getBoolPref("extensions.nagioschecker."+(i+1)+".disabled");
        	}
        	catch (e2) {
          		var gDis=false;
        	}
          	var auth = pm.getAuth((i+1));
          	this._servers.push({
                  url:surl,
                  name:this.preferences.getCharPref("extensions.nagioschecker."+(i+1)+".name"),
                  urlstatus:this.preferences.getCharPref("extensions.nagioschecker."+(i+1)+".urlstatus"),
                  username:(pPass) ? this.preferences.getCharPref("extensions.nagioschecker."+(i+1)+".username") : ((auth.user) ? auth.user : ''),
                  password:(pPass) ? this.preferences.getCharPref("extensions.nagioschecker."+(i+1)+".password") : ((auth.password) ? auth.password : ''),
                  versionOlderThan20:this.preferences.getBoolPref("extensions.nagioschecker."+(i+1)+".vot20"),
                  serverType:this.preferences.getIntPref("extensions.nagioschecker."+(i+1)+".servertype"),
                  getAliases:gAli,
                  aliases:{},
                  disabled:gDis
                  });
		   	if (!gDis) this._serversEnabled++;
           
		}
      }
    }
    catch(e) {
    }

			
			
			
		}
		
		
		
		
		
		return result;
	},




  isNewVersion: function() {

	var currVer = getExtensionVersion();
   		
  	try {
   		
  	  if ((!this.preferences.prefHasUserValue(cz.petrsimek.nch_branch+"version")) 
  	  		|| 
  	  		(this.preferences.getCharPref(cz.petrsimek.nch_branch+"version") == "")
  	  		||
  	  		(currVer!=this.preferences.getCharPref(cz.petrsimek.nch_branch+"version"))
  	  		) {
		this.preferences.setCharPref(cz.petrsimek.nch_branch+"version", currVer); 
  	  	return true; 
	  }  	
  	} catch(e) {
  	}

	return false;  	
  
  },

  isFF3: function() {
   try {
        var app = Components.classes["@mozilla.org/xre/app-info;1"]
                   .getService(Components.interfaces.nsIXULAppInfo)
                   .QueryInterface(Components.interfaces.nsIXULRuntime);
		return (
			(app.ID == '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}') 
			&&
			(app.version.match(new RegExp('^3')))
			);
        
    } catch(e) {
    }

	return false;
  
  
  } 


}


function NCHToolTip(pref) {
  this._rows=null;
  this.title=document.title;
  this._vbox=null;
  this.headers = [];
  this.pref = pref;
//  this.showColInfo=showColInfo;
//  this.showColAlias=showColAlias;
//  this.showColFlags=showColFlags;
	this.actH=-1;

  this.create = function(from) {
    this._tooltip=from;

    var doc=document;
    while (this._tooltip.childNodes.length > 0) this._tooltip.removeChild(this._tooltip.childNodes[0]);
    this._tooltip.removeAttribute("title");
    this._tooltip.removeAttribute("label");

    if (doc) {

    this._vbox = doc.createElement("vbox");


    var ph=window.screen.height-300;
    ph=(ph<300) ? 300 : ph;
//    ph=300;
	this._tooltip.setAttribute("maxheight",ph+"px");

    var pw=window.screen.width-100;
    pw=(pw<500) ? 500 : pw;
	this._tooltip.setAttribute("minwidth","500px");
	this._tooltip.setAttribute("maxwidth",(window.screen.width-100)+"px");


//    this._vbox.setAttribute("style","overflow: -moz-scrollbars-vertical;");
    this._vbox.setAttribute("flex","1");
   this._vbox.setAttribute("style","overflow: scroll;");
//    this._vbox.setAttribute("id",from.id+'-id');
		var grid = doc.createElement("grid");
		this._vbox.appendChild(grid);
		var cls = doc.createElement("columns");
		grid.appendChild(cls);
		var cl = doc.createElement("column");
		cls.appendChild(cl);
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
	if (this.pref.show_window_column_alias) {
//    if (this.showColAlias) {
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
    }
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
		if (this.pref.show_window_column_flags) {
//if (this.showColFlags) {		
			var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
			cls.appendChild(cl);
		}
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
		var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
		cls.appendChild(cl);
		if (this.pref.show_window_column_information) {
//    if (this.showColInfo) {
			var cl = doc.createElement("column");
//		cl.setAttribute("flex","1");
			cl.setAttribute("style","max-width:20px;");


		cls.appendChild(cl);
    	}
		this._rows = doc.createElement("rows");
		grid.appendChild(this._rows);

		var row = doc.createElement("row");
		this._rows.appendChild(row);

		var lNew = doc.createElement("label");
		lNew.setAttribute("value", "");
		
		row.appendChild(lNew);

		var lHost = doc.createElement("label");
		lHost.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("host"));
		row.appendChild(lHost);

//    if (this.showColAlias) {
		if (this.pref.show_window_column_alias) {
			var lAlias = doc.createElement("label");
			lAlias.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("hostAlias"));
//		lAlias.setAttribute("maxwidth", "50px");
			row.appendChild(lAlias);
		}
 		var lServ = doc.createElement("label");
	  lServ.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("service"));
	  row.appendChild(lServ);

//    if (this.showColFlags) {
		if (this.pref.show_window_column_flags) {
 			var lFlags = doc.createElement("label");
			  lFlags.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("flags"));
			  row.appendChild(lFlags);
	    }
		if (this.pref.show_window_column_attempt) {
	 		var lAttempt = doc.createElement("label");
		  lAttempt.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("attempt"));
		  row.appendChild(lAttempt);
		}
		if (this.pref.show_window_column_status) {
			var lStat = doc.createElement("label");
			lStat.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("status"));
			row.appendChild(lStat);
		}
		var lTime = doc.createElement("label");
		lTime.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("duration"));
		row.appendChild(lTime);

		if (this.pref.show_window_column_information) {
//    if (this.showColInfo) {
			var lInfo = doc.createElement("label");
			lInfo.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("information"));
			row.appendChild(lInfo);
    	}

		this._tooltip.appendChild(this._vbox);


	 for(var i = 0;i<this.headers.length;i++) {
    	if ((this.headers[i].problems.length) || (this.headers[i].error)) {
			this.createHeader(i,this.headers[i].data,this.headers[i].time);  
        	if (!this.headers[i].error) {

	  			this.headers[i].problems.sort(function (a,b) {
					return a.durationSec-b.durationSec;				
				});
				for(var j = 0;j<this.headers[i].problems.length;j++) {
					var serPo = this.headers[i].servPos;
  			  		this.createRow(this.headers[i].problems[j],i,serPo);
        		}
        	}
        	else {
         	this.createError();
        	}
      }
    }




//    this._tooltip.setAttribute("style","max-height:"+ph+"px;");
     
	  }



  }
  this.createHeader= function(pos,name,time) {

    var doc=document;

    if (doc) {
		

    var hbd = doc.createElement("hbox");
		this._rows.appendChild(hbd);

    var description = doc.createElement("description");
		description.setAttribute("class", "nagioschecker-tooltip-title");
		description.setAttribute("value",name+((time!=null) ? " ("+time.toLocaleString()+")" : ""));
		hbd.appendChild(description);
    var sp = doc.createElement("spacer");
		sp.setAttribute("flex", "1");
		hbd.appendChild(sp);


    }

  }
  this.createError= function() {

    var doc=document;

		var row = document.createElement("row");
 		this._rows.appendChild(row);

	    var hbd = doc.createElement("hbox");
		this._rows.appendChild(hbd);

		var lErr = document.createElement("label");
		lErr.setAttribute("class","error");
		lErr.setAttribute("value", cz.petrsimek.nagioschecker.bundle.getString("downloadError"));
		hbd.appendChild(lErr);



  }
  this.addHeader= function(name,serPo,timeFetch) {
		this.headers[++this.actH]={data:name,error:false,problems:[],aliases:{},news:{},servPos:serPo,time:timeFetch};
	}
  this.addError= function() {
		this.headers[this.actH].error=true;
	}
  this.addRow = function(problem,alias,isNew) {
		this.headers[this.actH].problems.push(problem);

		this.headers[this.actH].aliases[problem.host]=alias;
		this.headers[this.actH].news[problem.host]=isNew;
	}


  
  this.createRow = function(problem,i,serPo) {
		
	var row = document.createElement("row");
		
    var status_text = "";
    var useEnglish = (cz.petrsimek.nagioschecker.pref.statuses_translation==1);
    switch (problem.status) {
      case "down":
    		row.setAttribute("class", "nagioschecker-tooltip-row nagioschecker-tooltip-down-row");
        status_text = (useEnglish) ? "down" : cz.petrsimek.nagioschecker.bundle.getString("alertDown1")
        break;
      case "unreachable":
    		row.setAttribute("class", "nagioschecker-tooltip-row nagioschecker-tooltip-unreachable-row");
        status_text = (useEnglish) ? "unreachable" : cz.petrsimek.nagioschecker.bundle.getString("alertUnreachable1")
        break;
      case "unknown":
    		row.setAttribute("class", "nagioschecker-tooltip-row nagioschecker-tooltip-unknown-row");
        status_text = (useEnglish) ? "unknown" : cz.petrsimek.nagioschecker.bundle.getString("alertUnknown1")
        break;
      case "warning":
    		row.setAttribute("class", "nagioschecker-tooltip-row nagioschecker-tooltip-warning-row");
        status_text = (useEnglish) ? "warning" : cz.petrsimek.nagioschecker.bundle.getString("alertWarning1")
        break;
      case "critical":
    		row.setAttribute("class", "nagioschecker-tooltip-row nagioschecker-tooltip-critical-row");
        status_text = (useEnglish) ? "critical" : cz.petrsimek.nagioschecker.bundle.getString("alertCritical1")
        break;
    }
   
		row.setAttribute("onclick","cz.petrsimek.nagioschecker.hideNchPopup('"+this._tooltip.id+"');cz.petrsimek.nagioschecker.openTab(cz.petrsimek.nagioschecker.createUrlDevice('"+serPo+"','"+problem.host.replace(/\\/,'\\\\')+"',"+((problem.service) ? "'"+problem.service.replace(/\\/,'\\\\')+"'" : "null")+"))");

 		this._rows.appendChild(row);


		var lNew = document.createElement("label");
    if (this.headers[i].news[problem.host]) {
		  lNew.setAttribute("value", " ! ");
		  lNew.setAttribute("tooltiptext", cz.petrsimek.nagioschecker.bundle.getString("new"));
		  lNew.setAttribute("style", "font-weight:bold;");
    }
    else {
		lNew.setAttribute("value", "");
    }
		row.appendChild(lNew);


		var lHost = document.createElement("label");
		lHost.setAttribute("value", problem.host);


		row.appendChild(lHost);



		if (this.pref.show_window_column_alias) {
//    if (this.showColAlias) {
			var lAlias = document.createElement("label");

			lAlias.setAttribute("value", (this.headers[i].aliases[problem.host]) ? this.headers[i].aliases[problem.host] : "-");
			row.appendChild(lAlias);
		}
		var lServ = document.createElement("label");
		lServ.setAttribute("value", (problem.service==null) ? "-" : problem.service);
		row.appendChild(lServ);

		if (this.pref.show_window_column_flags) {
		var flags="";
		if (problem.acknowledged) flags+='Ac';
		if (problem.dischecks) flags+='Ch';
		if (problem.disnotifs) flags+='Nt';
		if (problem.downtime) flags+='Dw';
		if (problem.flapping) flags+='Fl';
		if (problem.onlypass) flags+='Pa';

//    if (this.showColFlags) {
			var lFlags = document.createElement("label");
			lFlags.setAttribute("value", flags);
			row.appendChild(lFlags);
	    }
		if (this.pref.show_window_column_attempt) {
		var lAttempt = document.createElement("label");
		lAttempt.setAttribute("value", problem.attempt);
		row.appendChild(lAttempt);
		}
		if (this.pref.show_window_column_status) {
		var lStat = document.createElement("label");
		lStat.setAttribute("value", status_text);
		row.appendChild(lStat);
		}
		var lTime = document.createElement("label");
		lTime.setAttribute("value", problem.duration);
		row.appendChild(lTime);


//    if (this.showColInfo) {
		if (this.pref.show_window_column_information) {
			var lInfo = document.createElement("label");
			lInfo.setAttribute("value", problem.info);
			lInfo.setAttribute("style","overflow:hidden;white-space:nowrap;");
			row.appendChild(lInfo);
    	}




  }


}

function NCHPaket(pref,cntErrors) {
	this.pref = pref;

	this.pt = ["down","unreachable","unknown","warning","critical"];
	this.ttip = [];

	this.all = [new Array(),0,0,[],[],0,0];
	this.down = [new Array(),0,0,[],[]];
	this.unreachable = [new Array(),0,0,[],[]];
	this.unknown = [new Array(),0,0,[],[]];
	this.warning = [new Array(),0,0,[],[]];
	this.critical = [new Array(),0,0,[],[]];

	this.countErrors = cntErrors;
	
	this.isError = false;
	this.sa = {
		all:[null,[0,0],[0,0],[0,0]],
		down:[null,[0,0],[0,0],[0,0]],
		unreachable:[null,[0,0],[0,0],[0,0]],
		unknown:[null,[0,0],[0,0],[0,0]],
		warning:[null,[0,0],[0,0],[0,0]],
		critical:[null,[0,0],[0,0],[0,0]]
		};
	this.addTooltipHeader = function(to,header,serverPos,timeFetch) {
		this.ttip.push({type:'header',data:header});
	 	this[to][0].push({type:'header',data:header,serverPos:serverPos,timeFetch:timeFetch});
	}
	this.addError = function(to) {
		this["isError"]=true;
	 	this[to][0].push({type:'error'});
	 	if (to=="all") this.countErrors++;
	 	
	}
	this.addProblem = function(serverPos,problemType,isOld,problem,aliasName) {
		var tmp_a = 1;
		if (!isOld) {
			this["all"][2] = (this["all"][2]) ? this["all"][2]+1 : 1;
			this["all"][4][serverPos] = (this["all"][4][serverPos]) ? this["all"][4][serverPos]+1 : 1;
			this[problemType][2] = (this[problemType][2]) ? this[problemType][2]+1 : 1;
			this[problemType][4][serverPos] = (this[problemType][4][serverPos]) ? this[problemType][4][serverPos]+1 : 1;
			if (problem.attemptInt>0) {
				tmp_a = (problem.attemptInt>3) ? 3 : problem.attemptInt;
				this.sa[problemType][tmp_a][1]++;
				this.sa['all'][tmp_a][1]++;
			}
		}
		if (problem.attemptInt>0) {
			tmp_a = (problem.attemptInt>3) ? 3 : problem.attemptInt;
			this.sa[problemType][tmp_a][0]++;
			this.sa['all'][tmp_a][0]++;
		}
		this.ttip.push({type:'problem',data:problem});
		this[problemType][1] = (this[problemType][1]) ? this[problemType][1]+1 : 1;
		this[problemType][3][serverPos] = (this[problemType][3][serverPos]) ? this[problemType][3][serverPos]+1 : 1;
	 	this["all"][0].push({type:'problem',data:problem,aliasName:aliasName,isNew:(!isOld)});

	 	this[problemType][0].push({type:'problem',data:problem,aliasName:aliasName,isNew:(!isOld)});
		this["all"][1] = (this["all"][1]) ? this["all"][1]+1 : 1;
		this["all"][3][serverPos] = (this["all"][3][serverPos]) ? this["all"][3][serverPos]+1 : 1;
	}
	this.checkServiceAttempt = function(problemType,value) {
		return (this.sa[problemType][value][1]>0);
	}
	this.checkOldServiceAttempt = function(problemType,value) {
		return (this.sa[problemType][value][0]>0);
	}
	this.getProblemsByType = function(problemType) {
	 	return this[problemType][3];
	}
	this.setCountErrors = function(num) {
	 	this.countErrors=num;
	}
	this.getCountErrors = function() {
	 	return this.countErrors;
	}
	this.countProblemsByType = function(problemType) {
 		return this[problemType][1];
	}
	this.countOldProblemsByType = function(problemType) {
	 	return this[problemType][2];
	}
	this.createTooltip = function(win) {
		var doc = win.document;
		var ttall=new NCHToolTip(this.pref);

		for(var i in this["all"][0]) {
			switch (this["all"][0][i]["type"]) {
				case "header":			
					ttall.addHeader(this["all"][0][i]["data"],this["all"][0][i]["serverPos"],this["all"][0][i]["timeFetch"]);
					break;
				case "error":			
					ttall.addError();
					break;
				case "problem":			
					ttall.addRow(this["all"][0][i]["data"],this["all"][0][i]["aliasName"],this["all"][0][i]["isNew"]);
					break;
			}
		}

        ttall.create(doc.getElementById('nagioschecker-popup'));
    	for(var i=0;i<this.pt.length;i++) {
	      if (this[this.pt[i]]) {
				var ttpt=new NCHToolTip(this.pref);

				for(var j in this[this.pt[i]][0]) {
					switch (this[this.pt[i]][0][j]["type"]) {
						case "header":			
							ttpt.addHeader(this[this.pt[i]][0][j]["data"],this[this.pt[i]][0][j]["serverPos"],this[this.pt[i]][0][j]["timeFetch"]);
							break;
						case "error":			
							ttpt.addError();
							break;
						case "problem":			
							ttpt.addRow(this[this.pt[i]][0][j]["data"],this[this.pt[i]][0][j]["aliasName"],this[this.pt[i]][0][j]["isNew"]);
							break;
					}
				}

	        ttpt.create(doc.getElementById('nagioschecker-popup-'+this.pt[i]));
	      }
	    }
	}
	this.isAtLeastOne =  function() {
		return (this["all"][1]>0);
	}
	this.isAtLeastOneByProblemType =  function(problemType) {
		return (this[problemType][1]>0);
	}
}

