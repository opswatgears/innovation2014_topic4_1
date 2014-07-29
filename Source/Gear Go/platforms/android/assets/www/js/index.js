var event = "";
var code = "";
var win = "";
var token = "";
var have_issue = true;

//for ajax query
var callbackUrl = "http://example.com";
var devicesURL = "https://gears.opswat.com/o/api/v2/devices";
var tokenURL  = "https://gears.opswat.com/o/oauth/token";
var accountURL = "https://gears.opswat.com/o/api/v2/account";

//for login info and authorize, insert your app client id and secret here
var account_client_id = "M62SGS3D6SG49131ULVDPVQ7PKXABGVCH5C4RBSAFZURGOKI";
var account_client_secret = "86S6OGOLBOGV538919W6ES7EGWJR2IOVYPPNMWROE4X3BT2C";

var devices_allow = "";
var devices_used = "";
var devices_have_issue = [];
var array_hwid_have_issue = [];
var count_issue = 0;
var hwidToQuery = "";
var listViewContent = "";

// Wait for Cordova to load
    
// querySelector, jQuery style
var $ = function (selector) {
  return document.querySelector(selector);
};

function dynamicEvent() {    
    
   hwidToQuery = this.id;
   var urlPagetoChange = "device.html?";
   var urlPageHaveIssued = "deviceHaveIssues.html?";
   
   urlPagetoChange += "id=" + hwidToQuery + "&token=" + token;
   urlPageHaveIssued += "id=" + hwidToQuery + "&token=" + token;
   var index = $.inArray(hwidToQuery, array_hwid_have_issue);
   if (index === -1)
      $.mobile.changePage(urlPagetoChange, { transition: "slide" });  
   else
      $.mobile.changePage(urlPageHaveIssued, { transition: "slide" });  
   
   var strQueryDevice = 'Get Infomation about devices have HWID: ' + hwidToQuery;
   window.plugins.toast.showLongCenter(strQueryDevice, function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
}
 
document.getElementById("LoginButton").onclick = function() {LoginFunction();};
document.getElementById("getDevicesButton").onclick = function() {apiFunction();};

var listDevices = document.getElementById('listDevices');

function apiFunction() {
    if (code === "" || token === "")
        {
            alert("must authorize first");
            return;            
        }
    window.plugins.toast.showLongBottom('Getting total Devices information, please wait ...', function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});    
    //call api to get all devices
     $.ajax({
                type: "GET",
                url: devicesURL,
                data: { 
                    "limit": devices_used,
                    "access_token" : token
                },
                dataType: "json",

                success: function (data) {                 
                    $.each(data, function(){	
			var total_issue = this.total_issue;
                        var hwid = this.hwid;
                        var os_name = this.os_info.name;
                        var machine_type = this.machine_type;
                        var hostname = this.hostname;
                        var json={"issue":total_issue, "hwid": hwid, "machine_type": machine_type, "hostname" : hostname, "os_name": os_name};
                        
                        var entry = document.createElement('li');
                        entry.id = hwid;
                        var innerHTML = "<a href=\"#\"> <img src=\"img/";
                        var innerType = "";
                        switch (machine_type) {
                            case "desktop":
                                innerType = "desktop.png";
                                break;
                            case "laptop":
                                innerType = "laptop.png";
                                break;
                            case "server":
                                innerType = "server.png";
                                break;
                            case "vm":
                                innerType = "vm.png";
                                break;
                            default:
                                break;
                        }
                        if (total_issue > 0)
                            hostname = hostname + " (Have " + total_issue.toString() + " issues)";
                        innerHTML += innerType + "\"> <h1> Machine Name : "  + hostname + " </h1><p align=\"center\">" + os_name + "</p></a>";
                        entry.innerHTML = innerHTML;
                        entry.className = "dynamic-link";
                        
                        listDevices.appendChild(entry);
                        entry.onclick = dynamicEvent;
                                                                       
                        if (total_issue > 0) //this device have issues
                        {
                           devices_have_issue.push(json);   
                           array_hwid_have_issue.push(hwid);
                        }
                    });
                    //update the dashboard
                    document.getElementById('devicesHaveIssue').innerHTML =  devices_have_issue.length + " devices " + "Have Issues";                                     
                    document.getElementById('devicesHaveTotal').innerHTML =  "Total " + devices_used + " devices";   
                },
                
                error: function (data) {
                    alert(JSON.stringify(data));
                }
            });     
}

function requestFunction() {
        if (code === "")
        {
            alert("must authorize first");
            return;            
        }        
        
        $.ajax({
                type: "POST",
                url: tokenURL,
                data: { 
                    "client_id": account_client_id, 
                    "client_secret": account_client_secret,
                    "grant_type": "authorization_code",
                    "redirect_uri": callbackUrl,
                    "code" : code
                },
                dataType: "json",

                success: function (data) {
                    token = data.access_token;
                    window.plugins.toast.showLongBottom('Get Token successfully', function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
                    
                    window.plugins.toast.showLongBottom('Getting info about your Account ...', function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
                    
                    $.ajax({
                        type: "GET",
                        url: accountURL,
                        data: { 
                            "access_token" : token
                        },
                        dataType: "json",

                       success: function (data) {
                           devices_used = data.devices_used.toString();
                           devices_allowed = data.devices_allowed.toString();
                           var deviceNoti = "You have " + devices_used + " devices used over " + devices_allowed + " total devices";
                           window.plugins.toast.showLongBottom(deviceNoti, function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
                       },
                       
                       error: function (data) {
                            alert(JSON.stringify(data));
                       }
                    });
                            
                },
                
                error: function (data) {
                    alert(JSON.stringify(data));
                }
            });   
}

function LoginFunction() {
            window.plugins.toast.showLongBottom('Opening login and authorize window ...', function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
            
            win = window.open("https://gears.opswat.com/o/oauth/authorize?client_id=" + account_client_id + "&response_type=code&redirect_uri=" + callbackUrl , '_blank', 'location=no');         
            
            win.addEventListener('loadstart', function(event) {                 
                window.scrollTo(2000,0);
                var path = event.url;
                var sub = path.substring(0, callbackUrl.length);
                if (sub === callbackUrl)
                {
                    win.close();
                    window.plugins.toast.showLongBottom('Get authorize code successfully', function(a){console.log('toast success: ' + a);}, function(b){alert('toast error: ' + b);});
                    code = path.substring(callbackUrl.length+7, path.length);
                    requestFunction();
                }
            } );                  
 }
