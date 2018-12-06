/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.Txs = (function() {

    /**
     * Properties of a Txs.
     * @exports ITxs
     * @interface ITxs
     * @property {Array.<ITx>|null} [txs] Txs txs
     */

    /**
     * Constructs a new Txs.
     * @exports Txs
     * @classdesc Represents a Txs.
     * @implements ITxs
     * @constructor
     * @param {ITxs=} [properties] Properties to set
     */
    function Txs(properties) {
        this.txs = [];
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Txs txs.
     * @member {Array.<ITx>} txs
     * @memberof Txs
     * @instance
     */
    Txs.prototype.txs = $util.emptyArray;

    /**
     * Creates a new Txs instance using the specified properties.
     * @function create
     * @memberof Txs
     * @static
     * @param {ITxs=} [properties] Properties to set
     * @returns {Txs} Txs instance
     */
    Txs.create = function create(properties) {
        return new Txs(properties);
    };

    /**
     * Encodes the specified Txs message. Does not implicitly {@link Txs.verify|verify} messages.
     * @function encode
     * @memberof Txs
     * @static
     * @param {ITxs} message Txs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Txs.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.txs != null && message.txs.length)
            for (var i = 0; i < message.txs.length; ++i)
                $root.Tx.encode(message.txs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Txs message, length delimited. Does not implicitly {@link Txs.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Txs
     * @static
     * @param {ITxs} message Txs message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Txs.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Txs message from the specified reader or buffer.
     * @function decode
     * @memberof Txs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Txs} Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Txs.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Txs();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                if (!(message.txs && message.txs.length))
                    message.txs = [];
                message.txs.push($root.Tx.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Txs message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Txs
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Txs} Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Txs.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Txs message.
     * @function verify
     * @memberof Txs
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Txs.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.txs != null && message.hasOwnProperty("txs")) {
            if (!Array.isArray(message.txs))
                return "txs: array expected";
            for (var i = 0; i < message.txs.length; ++i) {
                var error = $root.Tx.verify(message.txs[i]);
                if (error)
                    return "txs." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Txs message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Txs
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Txs} Txs
     */
    Txs.fromObject = function fromObject(object) {
        if (object instanceof $root.Txs)
            return object;
        var message = new $root.Txs();
        if (object.txs) {
            if (!Array.isArray(object.txs))
                throw TypeError(".Txs.txs: array expected");
            message.txs = [];
            for (var i = 0; i < object.txs.length; ++i) {
                if (typeof object.txs[i] !== "object")
                    throw TypeError(".Txs.txs: object expected");
                message.txs[i] = $root.Tx.fromObject(object.txs[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Txs message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Txs
     * @static
     * @param {Txs} message Txs
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Txs.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.arrays || options.defaults)
            object.txs = [];
        if (message.txs && message.txs.length) {
            object.txs = [];
            for (var j = 0; j < message.txs.length; ++j)
                object.txs[j] = $root.Tx.toObject(message.txs[j], options);
        }
        return object;
    };

    /**
     * Converts this Txs to JSON.
     * @function toJSON
     * @memberof Txs
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Txs.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Txs;
})();

$root.Tx = (function() {

    /**
     * Properties of a Tx.
     * @exports ITx
     * @interface ITx
     * @property {Uint8Array|null} [from] Tx from
     * @property {Uint8Array|null} [to] Tx to
     * @property {number|Long|null} [amount] Tx amount
     * @property {number|Long|null} [fee] Tx fee
     * @property {number|null} [nonce] Tx nonce
     * @property {Uint8Array|null} [signature] Tx signature
     * @property {number|null} [recovery] Tx recovery
     * @property {Uint8Array|null} [transitionSignature] Tx transitionSignature
     * @property {number|null} [transitionRecovery] Tx transitionRecovery
     * @property {string|null} [networkid] Tx networkid
     */

    /**
     * Constructs a new Tx.
     * @exports Tx
     * @classdesc Represents a Tx.
     * @implements ITx
     * @constructor
     * @param {ITx=} [properties] Properties to set
     */
    function Tx(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Tx from.
     * @member {Uint8Array} from
     * @memberof Tx
     * @instance
     */
    Tx.prototype.from = $util.newBuffer([]);

    /**
     * Tx to.
     * @member {Uint8Array} to
     * @memberof Tx
     * @instance
     */
    Tx.prototype.to = $util.newBuffer([]);

    /**
     * Tx amount.
     * @member {number|Long} amount
     * @memberof Tx
     * @instance
     */
    Tx.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Tx fee.
     * @member {number|Long} fee
     * @memberof Tx
     * @instance
     */
    Tx.prototype.fee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

    /**
     * Tx nonce.
     * @member {number} nonce
     * @memberof Tx
     * @instance
     */
    Tx.prototype.nonce = 0;

    /**
     * Tx signature.
     * @member {Uint8Array} signature
     * @memberof Tx
     * @instance
     */
    Tx.prototype.signature = $util.newBuffer([]);

    /**
     * Tx recovery.
     * @member {number} recovery
     * @memberof Tx
     * @instance
     */
    Tx.prototype.recovery = 0;

    /**
     * Tx transitionSignature.
     * @member {Uint8Array} transitionSignature
     * @memberof Tx
     * @instance
     */
    Tx.prototype.transitionSignature = $util.newBuffer([]);

    /**
     * Tx transitionRecovery.
     * @member {number} transitionRecovery
     * @memberof Tx
     * @instance
     */
    Tx.prototype.transitionRecovery = 0;

    /**
     * Tx networkid.
     * @member {string} networkid
     * @memberof Tx
     * @instance
     */
    Tx.prototype.networkid = "";

    /**
     * Creates a new Tx instance using the specified properties.
     * @function create
     * @memberof Tx
     * @static
     * @param {ITx=} [properties] Properties to set
     * @returns {Tx} Tx instance
     */
    Tx.create = function create(properties) {
        return new Tx(properties);
    };

    /**
     * Encodes the specified Tx message. Does not implicitly {@link Tx.verify|verify} messages.
     * @function encode
     * @memberof Tx
     * @static
     * @param {ITx} message Tx message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tx.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.from != null && message.hasOwnProperty("from"))
            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.from);
        if (message.to != null && message.hasOwnProperty("to"))
            writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.to);
        if (message.amount != null && message.hasOwnProperty("amount"))
            writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.amount);
        if (message.fee != null && message.hasOwnProperty("fee"))
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.fee);
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.nonce);
        if (message.signature != null && message.hasOwnProperty("signature"))
            writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.signature);
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.recovery);
        if (message.transitionSignature != null && message.hasOwnProperty("transitionSignature"))
            writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.transitionSignature);
        if (message.transitionRecovery != null && message.hasOwnProperty("transitionRecovery"))
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.transitionRecovery);
        if (message.networkid != null && message.hasOwnProperty("networkid"))
            writer.uint32(/* id 10, wireType 2 =*/82).string(message.networkid);
        return writer;
    };

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link Tx.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Tx
     * @static
     * @param {ITx} message Tx message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Tx.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @function decode
     * @memberof Tx
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Tx} Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tx.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Tx();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.from = reader.bytes();
                break;
            case 2:
                message.to = reader.bytes();
                break;
            case 3:
                message.amount = reader.uint64();
                break;
            case 4:
                message.fee = reader.uint64();
                break;
            case 5:
                message.nonce = reader.uint32();
                break;
            case 6:
                message.signature = reader.bytes();
                break;
            case 7:
                message.recovery = reader.uint32();
                break;
            case 8:
                message.transitionSignature = reader.bytes();
                break;
            case 9:
                message.transitionRecovery = reader.uint32();
                break;
            case 10:
                message.networkid = reader.string();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Tx
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Tx} Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Tx.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Tx message.
     * @function verify
     * @memberof Tx
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Tx.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.from != null && message.hasOwnProperty("from"))
            if (!(message.from && typeof message.from.length === "number" || $util.isString(message.from)))
                return "from: buffer expected";
        if (message.to != null && message.hasOwnProperty("to"))
            if (!(message.to && typeof message.to.length === "number" || $util.isString(message.to)))
                return "to: buffer expected";
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                return "amount: integer|Long expected";
        if (message.fee != null && message.hasOwnProperty("fee"))
            if (!$util.isInteger(message.fee) && !(message.fee && $util.isInteger(message.fee.low) && $util.isInteger(message.fee.high)))
                return "fee: integer|Long expected";
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            if (!$util.isInteger(message.nonce))
                return "nonce: integer expected";
        if (message.signature != null && message.hasOwnProperty("signature"))
            if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                return "signature: buffer expected";
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            if (!$util.isInteger(message.recovery))
                return "recovery: integer expected";
        if (message.transitionSignature != null && message.hasOwnProperty("transitionSignature"))
            if (!(message.transitionSignature && typeof message.transitionSignature.length === "number" || $util.isString(message.transitionSignature)))
                return "transitionSignature: buffer expected";
        if (message.transitionRecovery != null && message.hasOwnProperty("transitionRecovery"))
            if (!$util.isInteger(message.transitionRecovery))
                return "transitionRecovery: integer expected";
        if (message.networkid != null && message.hasOwnProperty("networkid"))
            if (!$util.isString(message.networkid))
                return "networkid: string expected";
        return null;
    };

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Tx
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Tx} Tx
     */
    Tx.fromObject = function fromObject(object) {
        if (object instanceof $root.Tx)
            return object;
        var message = new $root.Tx();
        if (object.from != null)
            if (typeof object.from === "string")
                $util.base64.decode(object.from, message.from = $util.newBuffer($util.base64.length(object.from)), 0);
            else if (object.from.length)
                message.from = object.from;
        if (object.to != null)
            if (typeof object.to === "string")
                $util.base64.decode(object.to, message.to = $util.newBuffer($util.base64.length(object.to)), 0);
            else if (object.to.length)
                message.to = object.to;
        if (object.amount != null)
            if ($util.Long)
                (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
            else if (typeof object.amount === "string")
                message.amount = parseInt(object.amount, 10);
            else if (typeof object.amount === "number")
                message.amount = object.amount;
            else if (typeof object.amount === "object")
                message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
        if (object.fee != null)
            if ($util.Long)
                (message.fee = $util.Long.fromValue(object.fee)).unsigned = true;
            else if (typeof object.fee === "string")
                message.fee = parseInt(object.fee, 10);
            else if (typeof object.fee === "number")
                message.fee = object.fee;
            else if (typeof object.fee === "object")
                message.fee = new $util.LongBits(object.fee.low >>> 0, object.fee.high >>> 0).toNumber(true);
        if (object.nonce != null)
            message.nonce = object.nonce >>> 0;
        if (object.signature != null)
            if (typeof object.signature === "string")
                $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
            else if (object.signature.length)
                message.signature = object.signature;
        if (object.recovery != null)
            message.recovery = object.recovery >>> 0;
        if (object.transitionSignature != null)
            if (typeof object.transitionSignature === "string")
                $util.base64.decode(object.transitionSignature, message.transitionSignature = $util.newBuffer($util.base64.length(object.transitionSignature)), 0);
            else if (object.transitionSignature.length)
                message.transitionSignature = object.transitionSignature;
        if (object.transitionRecovery != null)
            message.transitionRecovery = object.transitionRecovery >>> 0;
        if (object.networkid != null)
            message.networkid = String(object.networkid);
        return message;
    };

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Tx
     * @static
     * @param {Tx} message Tx
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Tx.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.from = options.bytes === String ? "" : [];
            object.to = options.bytes === String ? "" : [];
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.amount = options.longs === String ? "0" : 0;
            if ($util.Long) {
                var long = new $util.Long(0, 0, true);
                object.fee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
            } else
                object.fee = options.longs === String ? "0" : 0;
            object.nonce = 0;
            object.signature = options.bytes === String ? "" : [];
            object.recovery = 0;
            object.transitionSignature = options.bytes === String ? "" : [];
            object.transitionRecovery = 0;
            object.networkid = "";
        }
        if (message.from != null && message.hasOwnProperty("from"))
            object.from = options.bytes === String ? $util.base64.encode(message.from, 0, message.from.length) : options.bytes === Array ? Array.prototype.slice.call(message.from) : message.from;
        if (message.to != null && message.hasOwnProperty("to"))
            object.to = options.bytes === String ? $util.base64.encode(message.to, 0, message.to.length) : options.bytes === Array ? Array.prototype.slice.call(message.to) : message.to;
        if (message.amount != null && message.hasOwnProperty("amount"))
            if (typeof message.amount === "number")
                object.amount = options.longs === String ? String(message.amount) : message.amount;
            else
                object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
        if (message.fee != null && message.hasOwnProperty("fee"))
            if (typeof message.fee === "number")
                object.fee = options.longs === String ? String(message.fee) : message.fee;
            else
                object.fee = options.longs === String ? $util.Long.prototype.toString.call(message.fee) : options.longs === Number ? new $util.LongBits(message.fee.low >>> 0, message.fee.high >>> 0).toNumber(true) : message.fee;
        if (message.nonce != null && message.hasOwnProperty("nonce"))
            object.nonce = message.nonce;
        if (message.signature != null && message.hasOwnProperty("signature"))
            object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
        if (message.recovery != null && message.hasOwnProperty("recovery"))
            object.recovery = message.recovery;
        if (message.transitionSignature != null && message.hasOwnProperty("transitionSignature"))
            object.transitionSignature = options.bytes === String ? $util.base64.encode(message.transitionSignature, 0, message.transitionSignature.length) : options.bytes === Array ? Array.prototype.slice.call(message.transitionSignature) : message.transitionSignature;
        if (message.transitionRecovery != null && message.hasOwnProperty("transitionRecovery"))
            object.transitionRecovery = message.transitionRecovery;
        if (message.networkid != null && message.hasOwnProperty("networkid"))
            object.networkid = message.networkid;
        return object;
    };

    /**
     * Converts this Tx to JSON.
     * @function toJSON
     * @memberof Tx
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Tx.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Tx;
})();

module.exports = $root;
