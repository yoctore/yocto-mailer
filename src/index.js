var nodemailer = require('./modules/nodemailer/');
var mandrill = require('./modules/mandrill/');


/**
* Yocto Mailer
*
* This module implements two yocto wrapper, one for nodemailer, the second for mandrill
*
*
* @date : 09/06/2015
* @author : Cédric BALARD <cedric@yocto.re>
* @copyright : Yocto SAS, All right reserved
* @class Mailer
*/
function Mailer() {
  /**
   * Default unit instance for nodemailer
   *
   * @property nodemailer
   * @type nodemailer
   */
  this.nodemailer = nodemailer;

  /**
   * Default unit instance for mandrill
   *
   * @property mandrill
   * @type mandrill
   */
  this.mandrill = mandrill;
}

/**
 * Default get function
 *
 * @method get
 * @return {Mixed} wanted property
 */
 Mailer.prototype.get = function(name) {
  return this[name];
};

/**
* Export Mailer
*/
module.exports = new (Mailer)();
