import * as $protobuf from "protobufjs";

/** Properties of a Txs. */
export interface ITxs {

    /** Txs txs */
    txs?: (ITx[]|null);
}

/** Represents a Txs. */
export class Txs implements ITxs {

    /**
     * Constructs a new Txs.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITxs);

    /** Txs txs. */
    public txs: ITx[];

    /**
     * Creates a new Txs instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Txs instance
     */
    public static create(properties?: ITxs): Txs;

    /**
     * Encodes the specified Txs message. Does not implicitly {@link Txs.verify|verify} messages.
     * @param message Txs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Txs message, length delimited. Does not implicitly {@link Txs.verify|verify} messages.
     * @param message Txs message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITxs, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Txs message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Txs;

    /**
     * Decodes a Txs message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Txs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Txs;

    /**
     * Verifies a Txs message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Txs message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Txs
     */
    public static fromObject(object: { [k: string]: any }): Txs;

    /**
     * Creates a plain object from a Txs message. Also converts values to other types if specified.
     * @param message Txs
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Txs, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Txs to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Tx. */
export interface ITx {

    /** Tx from */
    from?: (Uint8Array|null);

    /** Tx to */
    to?: (Uint8Array|null);

    /** Tx amount */
    amount?: (number|Long|null);

    /** Tx fee */
    fee?: (number|Long|null);

    /** Tx nonce */
    nonce?: (number|null);

    /** Tx signature */
    signature?: (Uint8Array|null);

    /** Tx recovery */
    recovery?: (number|null);

    /** Tx transitionSignature */
    transitionSignature?: (Uint8Array|null);

    /** Tx transitionRecovery */
    transitionRecovery?: (number|null);

    /** Tx networkid */
    networkid?: (string|null);
}

/** Represents a Tx. */
export class Tx implements ITx {

    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITx);

    /** Tx from. */
    public from: Uint8Array;

    /** Tx to. */
    public to: Uint8Array;

    /** Tx amount. */
    public amount: (number|Long);

    /** Tx fee. */
    public fee: (number|Long);

    /** Tx nonce. */
    public nonce: number;

    /** Tx signature. */
    public signature: Uint8Array;

    /** Tx recovery. */
    public recovery: number;

    /** Tx transitionSignature. */
    public transitionSignature: Uint8Array;

    /** Tx transitionRecovery. */
    public transitionRecovery: number;

    /** Tx networkid. */
    public networkid: string;

    /**
     * Creates a new Tx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tx instance
     */
    public static create(properties?: ITx): Tx;

    /**
     * Encodes the specified Tx message. Does not implicitly {@link Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITx, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Tx;

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Tx;

    /**
     * Verifies a Tx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tx
     */
    public static fromObject(object: { [k: string]: any }): Tx;

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @param message Tx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Tx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
