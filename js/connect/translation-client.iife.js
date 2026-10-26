var LakerTranslation = (function (exports) {
    'use strict';

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Assert that condition is truthy or throw error (with message)
     */
    function assert(condition, msg) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- we want the implicit conversion to boolean
        if (!condition) {
            throw new Error(msg);
        }
    }
    const FLOAT32_MAX = 3.4028234663852886e38, FLOAT32_MIN = -34028234663852886e22, UINT32_MAX = 0xffffffff, INT32_MAX = 0x7fffffff, INT32_MIN = -2147483648;
    /**
     * Assert a valid signed protobuf 32-bit integer.
     */
    function assertInt32(arg) {
        if (typeof arg !== "number")
            throw new Error("invalid int 32: " + typeof arg);
        if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
            throw new Error("invalid int 32: " + arg); // eslint-disable-line @typescript-eslint/restrict-plus-operands -- we want the implicit conversion to string
    }
    /**
     * Assert a valid unsigned protobuf 32-bit integer.
     */
    function assertUInt32(arg) {
        if (typeof arg !== "number")
            throw new Error("invalid uint 32: " + typeof arg);
        if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
            throw new Error("invalid uint 32: " + arg); // eslint-disable-line @typescript-eslint/restrict-plus-operands -- we want the implicit conversion to string
    }
    /**
     * Assert a valid protobuf float value.
     */
    function assertFloat32(arg) {
        if (typeof arg !== "number")
            throw new Error("invalid float 32: " + typeof arg);
        if (!Number.isFinite(arg))
            return;
        if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
            throw new Error("invalid float 32: " + arg); // eslint-disable-line @typescript-eslint/restrict-plus-operands -- we want the implicit conversion to string
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    const enumTypeSymbol = Symbol("@bufbuild/protobuf/enum-type");
    /**
     * Get reflection information from a generated enum.
     * If this function is called on something other than a generated
     * enum, it raises an error.
     */
    function getEnumType(enumObject) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any
        const t = enumObject[enumTypeSymbol];
        assert(t, "missing enum type on enum object");
        return t; // eslint-disable-line @typescript-eslint/no-unsafe-return
    }
    /**
     * Sets reflection information on a generated enum.
     */
    function setEnumType(enumObject, typeName, values, opt) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        enumObject[enumTypeSymbol] = makeEnumType(typeName, values.map((v) => ({
            no: v.no,
            name: v.name,
            localName: enumObject[v.no],
        })));
    }
    /**
     * Create a new EnumType with the given values.
     */
    function makeEnumType(typeName, values, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _opt) {
        const names = Object.create(null);
        const numbers = Object.create(null);
        const normalValues = [];
        for (const value of values) {
            // We do not surface options at this time
            // const value: EnumValueInfo = {...v, options: v.options ?? emptyReadonlyObject};
            const n = normalizeEnumValue(value);
            normalValues.push(n);
            names[value.name] = n;
            numbers[value.no] = n;
        }
        return {
            typeName,
            values: normalValues,
            // We do not surface options at this time
            // options: opt?.options ?? Object.create(null),
            findName(name) {
                return names[name];
            },
            findNumber(no) {
                return numbers[no];
            },
        };
    }
    /**
     * Create a new enum object with the given values.
     * Sets reflection information.
     */
    function makeEnum(typeName, values, opt) {
        const enumObject = {};
        for (const value of values) {
            const n = normalizeEnumValue(value);
            enumObject[n.localName] = n.no;
            enumObject[n.no] = n.localName;
        }
        setEnumType(enumObject, typeName, values);
        return enumObject;
    }
    function normalizeEnumValue(value) {
        if ("localName" in value) {
            return value;
        }
        return Object.assign(Object.assign({}, value), { localName: value.name });
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Message is the base class of every message, generated, or created at
     * runtime.
     *
     * It is _not_ safe to extend this class. If you want to create a message at
     * run time, use proto3.makeMessageType().
     */
    class Message {
        /**
         * Compare with a message of the same type.
         * Note that this function disregards extensions and unknown fields.
         */
        equals(other) {
            return this.getType().runtime.util.equals(this.getType(), this, other);
        }
        /**
         * Create a deep copy.
         */
        clone() {
            return this.getType().runtime.util.clone(this);
        }
        /**
         * Parse from binary data, merging fields.
         *
         * Repeated fields are appended. Map entries are added, overwriting
         * existing keys.
         *
         * If a message field is already present, it will be merged with the
         * new data.
         */
        fromBinary(bytes, options) {
            const type = this.getType(), format = type.runtime.bin, opt = format.makeReadOptions(options);
            format.readMessage(this, opt.readerFactory(bytes), bytes.byteLength, opt);
            return this;
        }
        /**
         * Parse a message from a JSON value.
         */
        fromJson(jsonValue, options) {
            const type = this.getType(), format = type.runtime.json, opt = format.makeReadOptions(options);
            format.readMessage(type, jsonValue, opt, this);
            return this;
        }
        /**
         * Parse a message from a JSON string.
         */
        fromJsonString(jsonString, options) {
            let json;
            try {
                json = JSON.parse(jsonString);
            }
            catch (e) {
                throw new Error(`cannot decode ${this.getType().typeName} from JSON: ${e instanceof Error ? e.message : String(e)}`);
            }
            return this.fromJson(json, options);
        }
        /**
         * Serialize the message to binary data.
         */
        toBinary(options) {
            const type = this.getType(), bin = type.runtime.bin, opt = bin.makeWriteOptions(options), writer = opt.writerFactory();
            bin.writeMessage(this, writer, opt);
            return writer.finish();
        }
        /**
         * Serialize the message to a JSON value, a JavaScript value that can be
         * passed to JSON.stringify().
         */
        toJson(options) {
            const type = this.getType(), json = type.runtime.json, opt = json.makeWriteOptions(options);
            return json.writeMessage(this, opt);
        }
        /**
         * Serialize the message to a JSON string.
         */
        toJsonString(options) {
            var _a;
            const value = this.toJson(options);
            return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
        }
        /**
         * Override for serialization behavior. This will be invoked when calling
         * JSON.stringify on this message (i.e. JSON.stringify(msg)).
         *
         * Note that this will not serialize google.protobuf.Any with a packed
         * message because the protobuf JSON format specifies that it needs to be
         * unpacked, and this is only possible with a type registry to look up the
         * message type.  As a result, attempting to serialize a message with this
         * type will throw an Error.
         *
         * This method is protected because you should not need to invoke it
         * directly -- instead use JSON.stringify or toJsonString for
         * stringified JSON.  Alternatively, if actual JSON is desired, you should
         * use toJson.
         */
        toJSON() {
            return this.toJson({
                emitDefaultValues: true,
            });
        }
        /**
         * Retrieve the MessageType of this message - a singleton that represents
         * the protobuf message declaration and provides metadata for reflection-
         * based operations.
         */
        getType() {
            // Any class that extends Message _must_ provide a complete static
            // implementation of MessageType.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
            return Object.getPrototypeOf(this).constructor;
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create a new message type using the given runtime.
     */
    function makeMessageType(runtime, typeName, fields, opt) {
        var _a;
        const localName = (_a = opt === null || opt === void 0 ? void 0 : opt.localName) !== null && _a !== void 0 ? _a : typeName.substring(typeName.lastIndexOf(".") + 1);
        const type = {
            [localName]: function (data) {
                runtime.util.initFields(this);
                runtime.util.initPartial(data, this);
            },
        }[localName];
        Object.setPrototypeOf(type.prototype, new Message());
        Object.assign(type, {
            runtime,
            typeName,
            fields: runtime.util.newFieldList(fields),
            fromBinary(bytes, options) {
                return new type().fromBinary(bytes, options);
            },
            fromJson(jsonValue, options) {
                return new type().fromJson(jsonValue, options);
            },
            fromJsonString(jsonString, options) {
                return new type().fromJsonString(jsonString, options);
            },
            equals(a, b) {
                return runtime.util.equals(type, a, b);
            },
        });
        return type;
    }

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    var env = {};

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    var browser$1 = {
      env: env};

    // Copyright 2008 Google Inc.  All rights reserved.
    //
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions are
    // met:
    //
    // * Redistributions of source code must retain the above copyright
    // notice, this list of conditions and the following disclaimer.
    // * Redistributions in binary form must reproduce the above
    // copyright notice, this list of conditions and the following disclaimer
    // in the documentation and/or other materials provided with the
    // distribution.
    // * Neither the name of Google Inc. nor the names of its
    // contributors may be used to endorse or promote products derived from
    // this software without specific prior written permission.
    //
    // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
    // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
    // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
    // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
    // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
    // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
    // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    //
    // Code generated by the Protocol Buffer compiler is owned by the owner
    // of the input file used when generating it.  This code is not
    // standalone and requires a support library to be linked with it.  This
    // support library is itself covered by the above license.
    /* eslint-disable prefer-const,@typescript-eslint/restrict-plus-operands */
    /**
     * Read a 64 bit varint as two JS numbers.
     *
     * Returns tuple:
     * [0]: low bits
     * [1]: high bits
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L175
     */
    function varint64read() {
        let lowBits = 0;
        let highBits = 0;
        for (let shift = 0; shift < 28; shift += 7) {
            let b = this.buf[this.pos++];
            lowBits |= (b & 0x7f) << shift;
            if ((b & 0x80) == 0) {
                this.assertBounds();
                return [lowBits, highBits];
            }
        }
        let middleByte = this.buf[this.pos++];
        // last four bits of the first 32 bit number
        lowBits |= (middleByte & 0x0f) << 28;
        // 3 upper bits are part of the next 32 bit number
        highBits = (middleByte & 0x70) >> 4;
        if ((middleByte & 0x80) == 0) {
            this.assertBounds();
            return [lowBits, highBits];
        }
        for (let shift = 3; shift <= 31; shift += 7) {
            let b = this.buf[this.pos++];
            highBits |= (b & 0x7f) << shift;
            if ((b & 0x80) == 0) {
                this.assertBounds();
                return [lowBits, highBits];
            }
        }
        throw new Error("invalid varint");
    }
    /**
     * Write a 64 bit varint, given as two JS numbers, to the given bytes array.
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/writer.js#L344
     */
    function varint64write(lo, hi, bytes) {
        for (let i = 0; i < 28; i = i + 7) {
            const shift = lo >>> i;
            const hasNext = !(shift >>> 7 == 0 && hi == 0);
            const byte = (hasNext ? shift | 0x80 : shift) & 0xff;
            bytes.push(byte);
            if (!hasNext) {
                return;
            }
        }
        const splitBits = ((lo >>> 28) & 0x0f) | ((hi & 0x07) << 4);
        const hasMoreBits = !(hi >> 3 == 0);
        bytes.push((hasMoreBits ? splitBits | 0x80 : splitBits) & 0xff);
        if (!hasMoreBits) {
            return;
        }
        for (let i = 3; i < 31; i = i + 7) {
            const shift = hi >>> i;
            const hasNext = !(shift >>> 7 == 0);
            const byte = (hasNext ? shift | 0x80 : shift) & 0xff;
            bytes.push(byte);
            if (!hasNext) {
                return;
            }
        }
        bytes.push((hi >>> 31) & 0x01);
    }
    // constants for binary math
    const TWO_PWR_32_DBL = 0x100000000;
    /**
     * Parse decimal string of 64 bit integer value as two JS numbers.
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
     */
    function int64FromString(dec) {
        // Check for minus sign.
        const minus = dec[0] === "-";
        if (minus) {
            dec = dec.slice(1);
        }
        // Work 6 decimal digits at a time, acting like we're converting base 1e6
        // digits to binary. This is safe to do with floating point math because
        // Number.isSafeInteger(ALL_32_BITS * 1e6) == true.
        const base = 1e6;
        let lowBits = 0;
        let highBits = 0;
        function add1e6digit(begin, end) {
            // Note: Number('') is 0.
            const digit1e6 = Number(dec.slice(begin, end));
            highBits *= base;
            lowBits = lowBits * base + digit1e6;
            // Carry bits from lowBits to
            if (lowBits >= TWO_PWR_32_DBL) {
                highBits = highBits + ((lowBits / TWO_PWR_32_DBL) | 0);
                lowBits = lowBits % TWO_PWR_32_DBL;
            }
        }
        add1e6digit(-24, -18);
        add1e6digit(-18, -12);
        add1e6digit(-12, -6);
        add1e6digit(-6);
        return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
    }
    /**
     * Losslessly converts a 64-bit signed integer in 32:32 split representation
     * into a decimal string.
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
     */
    function int64ToString(lo, hi) {
        let bits = newBits(lo, hi);
        // If we're treating the input as a signed value and the high bit is set, do
        // a manual two's complement conversion before the decimal conversion.
        const negative = (bits.hi & 0x80000000);
        if (negative) {
            bits = negate(bits.lo, bits.hi);
        }
        const result = uInt64ToString(bits.lo, bits.hi);
        return negative ? "-" + result : result;
    }
    /**
     * Losslessly converts a 64-bit unsigned integer in 32:32 split representation
     * into a decimal string.
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
     */
    function uInt64ToString(lo, hi) {
        ({ lo, hi } = toUnsigned(lo, hi));
        // Skip the expensive conversion if the number is small enough to use the
        // built-in conversions.
        // Number.MAX_SAFE_INTEGER = 0x001FFFFF FFFFFFFF, thus any number with
        // highBits <= 0x1FFFFF can be safely expressed with a double and retain
        // integer precision.
        // Proven by: Number.isSafeInteger(0x1FFFFF * 2**32 + 0xFFFFFFFF) == true.
        if (hi <= 0x1FFFFF) {
            return String(TWO_PWR_32_DBL * hi + lo);
        }
        // What this code is doing is essentially converting the input number from
        // base-2 to base-1e7, which allows us to represent the 64-bit range with
        // only 3 (very large) digits. Those digits are then trivial to convert to
        // a base-10 string.
        // The magic numbers used here are -
        // 2^24 = 16777216 = (1,6777216) in base-1e7.
        // 2^48 = 281474976710656 = (2,8147497,6710656) in base-1e7.
        // Split 32:32 representation into 16:24:24 representation so our
        // intermediate digits don't overflow.
        const low = lo & 0xFFFFFF;
        const mid = ((lo >>> 24) | (hi << 8)) & 0xFFFFFF;
        const high = (hi >> 16) & 0xFFFF;
        // Assemble our three base-1e7 digits, ignoring carries. The maximum
        // value in a digit at this step is representable as a 48-bit integer, which
        // can be stored in a 64-bit floating point number.
        let digitA = low + (mid * 6777216) + (high * 6710656);
        let digitB = mid + (high * 8147497);
        let digitC = (high * 2);
        // Apply carries from A to B and from B to C.
        const base = 10000000;
        if (digitA >= base) {
            digitB += Math.floor(digitA / base);
            digitA %= base;
        }
        if (digitB >= base) {
            digitC += Math.floor(digitB / base);
            digitB %= base;
        }
        // If digitC is 0, then we should have returned in the trivial code path
        // at the top for non-safe integers. Given this, we can assume both digitB
        // and digitA need leading zeros.
        return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) +
            decimalFrom1e7WithLeadingZeros(digitA);
    }
    function toUnsigned(lo, hi) {
        return { lo: lo >>> 0, hi: hi >>> 0 };
    }
    function newBits(lo, hi) {
        return { lo: lo | 0, hi: hi | 0 };
    }
    /**
     * Returns two's compliment negation of input.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Signed_32-bit_integers
     */
    function negate(lowBits, highBits) {
        highBits = ~highBits;
        if (lowBits) {
            lowBits = ~lowBits + 1;
        }
        else {
            // If lowBits is 0, then bitwise-not is 0xFFFFFFFF,
            // adding 1 to that, results in 0x100000000, which leaves
            // the low bits 0x0 and simply adds one to the high bits.
            highBits += 1;
        }
        return newBits(lowBits, highBits);
    }
    /**
     * Returns decimal representation of digit1e7 with leading zeros.
     */
    const decimalFrom1e7WithLeadingZeros = (digit1e7) => {
        const partial = String(digit1e7);
        return "0000000".slice(partial.length) + partial;
    };
    /**
     * Write a 32 bit varint, signed or unsigned. Same as `varint64write(0, value, bytes)`
     *
     * Copyright 2008 Google Inc.  All rights reserved.
     *
     * See https://github.com/protocolbuffers/protobuf/blob/1b18833f4f2a2f681f4e4a25cdf3b0a43115ec26/js/binary/encoder.js#L144
     */
    function varint32write(value, bytes) {
        if (value >= 0) {
            // write value as varint 32
            while (value > 0x7f) {
                bytes.push((value & 0x7f) | 0x80);
                value = value >>> 7;
            }
            bytes.push(value);
        }
        else {
            for (let i = 0; i < 9; i++) {
                bytes.push((value & 127) | 128);
                value = value >> 7;
            }
            bytes.push(1);
        }
    }
    /**
     * Read an unsigned 32 bit varint.
     *
     * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L220
     */
    function varint32read() {
        let b = this.buf[this.pos++];
        let result = b & 0x7f;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return result;
        }
        b = this.buf[this.pos++];
        result |= (b & 0x7f) << 7;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return result;
        }
        b = this.buf[this.pos++];
        result |= (b & 0x7f) << 14;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return result;
        }
        b = this.buf[this.pos++];
        result |= (b & 0x7f) << 21;
        if ((b & 0x80) == 0) {
            this.assertBounds();
            return result;
        }
        // Extract only last 4 bits
        b = this.buf[this.pos++];
        result |= (b & 0x0f) << 28;
        for (let readBytes = 5; (b & 0x80) !== 0 && readBytes < 10; readBytes++)
            b = this.buf[this.pos++];
        if ((b & 0x80) != 0)
            throw new Error("invalid varint");
        this.assertBounds();
        // Result can have 32 bits, convert it to unsigned
        return result >>> 0;
    }

    function makeInt64Support() {
        const dv = new DataView(new ArrayBuffer(8));
        // note that Safari 14 implements BigInt, but not the DataView methods
        const ok = typeof BigInt === "function" &&
            typeof dv.getBigInt64 === "function" &&
            typeof dv.getBigUint64 === "function" &&
            typeof dv.setBigInt64 === "function" &&
            typeof dv.setBigUint64 === "function" &&
            (typeof browser$1 != "object" ||
                typeof browser$1.env != "object" ||
                browser$1.env.BUF_BIGINT_DISABLE !== "1");
        if (ok) {
            const MIN = BigInt("-9223372036854775808"), MAX = BigInt("9223372036854775807"), UMIN = BigInt("0"), UMAX = BigInt("18446744073709551615");
            return {
                zero: BigInt(0),
                supported: true,
                parse(value) {
                    const bi = typeof value == "bigint" ? value : BigInt(value);
                    if (bi > MAX || bi < MIN) {
                        throw new Error(`int64 invalid: ${value}`);
                    }
                    return bi;
                },
                uParse(value) {
                    const bi = typeof value == "bigint" ? value : BigInt(value);
                    if (bi > UMAX || bi < UMIN) {
                        throw new Error(`uint64 invalid: ${value}`);
                    }
                    return bi;
                },
                enc(value) {
                    dv.setBigInt64(0, this.parse(value), true);
                    return {
                        lo: dv.getInt32(0, true),
                        hi: dv.getInt32(4, true),
                    };
                },
                uEnc(value) {
                    dv.setBigInt64(0, this.uParse(value), true);
                    return {
                        lo: dv.getInt32(0, true),
                        hi: dv.getInt32(4, true),
                    };
                },
                dec(lo, hi) {
                    dv.setInt32(0, lo, true);
                    dv.setInt32(4, hi, true);
                    return dv.getBigInt64(0, true);
                },
                uDec(lo, hi) {
                    dv.setInt32(0, lo, true);
                    dv.setInt32(4, hi, true);
                    return dv.getBigUint64(0, true);
                },
            };
        }
        const assertInt64String = (value) => assert(/^-?[0-9]+$/.test(value), `int64 invalid: ${value}`);
        const assertUInt64String = (value) => assert(/^[0-9]+$/.test(value), `uint64 invalid: ${value}`);
        return {
            zero: "0",
            supported: false,
            parse(value) {
                if (typeof value != "string") {
                    value = value.toString();
                }
                assertInt64String(value);
                return value;
            },
            uParse(value) {
                if (typeof value != "string") {
                    value = value.toString();
                }
                assertUInt64String(value);
                return value;
            },
            enc(value) {
                if (typeof value != "string") {
                    value = value.toString();
                }
                assertInt64String(value);
                return int64FromString(value);
            },
            uEnc(value) {
                if (typeof value != "string") {
                    value = value.toString();
                }
                assertUInt64String(value);
                return int64FromString(value);
            },
            dec(lo, hi) {
                return int64ToString(lo, hi);
            },
            uDec(lo, hi) {
                return uInt64ToString(lo, hi);
            },
        };
    }
    const protoInt64 = makeInt64Support();

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Scalar value types. This is a subset of field types declared by protobuf
     * enum google.protobuf.FieldDescriptorProto.Type The types GROUP and MESSAGE
     * are omitted, but the numerical values are identical.
     */
    var ScalarType;
    (function (ScalarType) {
        // 0 is reserved for errors.
        // Order is weird for historical reasons.
        ScalarType[ScalarType["DOUBLE"] = 1] = "DOUBLE";
        ScalarType[ScalarType["FLOAT"] = 2] = "FLOAT";
        // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT64 if
        // negative values are likely.
        ScalarType[ScalarType["INT64"] = 3] = "INT64";
        ScalarType[ScalarType["UINT64"] = 4] = "UINT64";
        // Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT32 if
        // negative values are likely.
        ScalarType[ScalarType["INT32"] = 5] = "INT32";
        ScalarType[ScalarType["FIXED64"] = 6] = "FIXED64";
        ScalarType[ScalarType["FIXED32"] = 7] = "FIXED32";
        ScalarType[ScalarType["BOOL"] = 8] = "BOOL";
        ScalarType[ScalarType["STRING"] = 9] = "STRING";
        // Tag-delimited aggregate.
        // Group type is deprecated and not supported in proto3. However, Proto3
        // implementations should still be able to parse the group wire format and
        // treat group fields as unknown fields.
        // TYPE_GROUP = 10,
        // TYPE_MESSAGE = 11,  // Length-delimited aggregate.
        // New in version 2.
        ScalarType[ScalarType["BYTES"] = 12] = "BYTES";
        ScalarType[ScalarType["UINT32"] = 13] = "UINT32";
        // TYPE_ENUM = 14,
        ScalarType[ScalarType["SFIXED32"] = 15] = "SFIXED32";
        ScalarType[ScalarType["SFIXED64"] = 16] = "SFIXED64";
        ScalarType[ScalarType["SINT32"] = 17] = "SINT32";
        ScalarType[ScalarType["SINT64"] = 18] = "SINT64";
    })(ScalarType || (ScalarType = {}));
    /**
     * JavaScript representation of fields with 64 bit integral types (int64, uint64,
     * sint64, fixed64, sfixed64).
     *
     * This is a subset of google.protobuf.FieldOptions.JSType, which defines JS_NORMAL,
     * JS_STRING, and JS_NUMBER. Protobuf-ES uses BigInt by default, but will use
     * String if `[jstype = JS_STRING]` is specified.
     *
     * ```protobuf
     * uint64 field_a = 1; // BigInt
     * uint64 field_b = 2 [jstype = JS_NORMAL]; // BigInt
     * uint64 field_b = 2 [jstype = JS_NUMBER]; // BigInt
     * uint64 field_b = 2 [jstype = JS_STRING]; // String
     * ```
     */
    var LongType;
    (function (LongType) {
        /**
         * Use JavaScript BigInt.
         */
        LongType[LongType["BIGINT"] = 0] = "BIGINT";
        /**
         * Use JavaScript String.
         *
         * Field option `[jstype = JS_STRING]`.
         */
        LongType[LongType["STRING"] = 1] = "STRING";
    })(LongType || (LongType = {}));

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Returns true if both scalar values are equal.
     */
    function scalarEquals(type, a, b) {
        if (a === b) {
            // This correctly matches equal values except BYTES and (possibly) 64-bit integers.
            return true;
        }
        // Special case BYTES - we need to compare each byte individually
        if (type == ScalarType.BYTES) {
            if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
                return false;
            }
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
        // Special case 64-bit integers - we support number, string and bigint representation.
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (type) {
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                // Loose comparison will match between 0n, 0 and "0".
                return a == b;
        }
        // Anything that hasn't been caught by strict comparison or special cased
        // BYTES and 64-bit integers is not equal.
        return false;
    }
    /**
     * Returns the zero value for the given scalar type.
     */
    function scalarZeroValue(type, longType) {
        switch (type) {
            case ScalarType.BOOL:
                return false;
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- acceptable since it's covered by tests
                return (longType == 0 ? protoInt64.zero : "0");
            case ScalarType.DOUBLE:
            case ScalarType.FLOAT:
                return 0.0;
            case ScalarType.BYTES:
                return new Uint8Array(0);
            case ScalarType.STRING:
                return "";
            default:
                // Handles INT32, UINT32, SINT32, FIXED32, SFIXED32.
                // We do not use individual cases to save a few bytes code size.
                return 0;
        }
    }
    /**
     * Returns true for a zero-value. For example, an integer has the zero-value `0`,
     * a boolean is `false`, a string is `""`, and bytes is an empty Uint8Array.
     *
     * In proto3, zero-values are not written to the wire, unless the field is
     * optional or repeated.
     */
    function isScalarZeroValue(type, value) {
        switch (type) {
            case ScalarType.BOOL:
                return value === false;
            case ScalarType.STRING:
                return value === "";
            case ScalarType.BYTES:
                return value instanceof Uint8Array && !value.byteLength;
            default:
                return value == 0; // Loose comparison matches 0n, 0 and "0"
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /* eslint-disable prefer-const,no-case-declarations,@typescript-eslint/restrict-plus-operands */
    /**
     * Protobuf binary format wire types.
     *
     * A wire type provides just enough information to find the length of the
     * following value.
     *
     * See https://developers.google.com/protocol-buffers/docs/encoding#structure
     */
    var WireType;
    (function (WireType) {
        /**
         * Used for int32, int64, uint32, uint64, sint32, sint64, bool, enum
         */
        WireType[WireType["Varint"] = 0] = "Varint";
        /**
         * Used for fixed64, sfixed64, double.
         * Always 8 bytes with little-endian byte order.
         */
        WireType[WireType["Bit64"] = 1] = "Bit64";
        /**
         * Used for string, bytes, embedded messages, packed repeated fields
         *
         * Only repeated numeric types (types which use the varint, 32-bit,
         * or 64-bit wire types) can be packed. In proto3, such fields are
         * packed by default.
         */
        WireType[WireType["LengthDelimited"] = 2] = "LengthDelimited";
        /**
         * Start of a tag-delimited aggregate, such as a proto2 group, or a message
         * in editions with message_encoding = DELIMITED.
         */
        WireType[WireType["StartGroup"] = 3] = "StartGroup";
        /**
         * End of a tag-delimited aggregate.
         */
        WireType[WireType["EndGroup"] = 4] = "EndGroup";
        /**
         * Used for fixed32, sfixed32, float.
         * Always 4 bytes with little-endian byte order.
         */
        WireType[WireType["Bit32"] = 5] = "Bit32";
    })(WireType || (WireType = {}));
    class BinaryWriter {
        constructor(textEncoder) {
            /**
             * Previous fork states.
             */
            this.stack = [];
            this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
            this.chunks = [];
            this.buf = [];
        }
        /**
         * Return all bytes written and reset this writer.
         */
        finish() {
            this.chunks.push(new Uint8Array(this.buf)); // flush the buffer
            let len = 0;
            for (let i = 0; i < this.chunks.length; i++)
                len += this.chunks[i].length;
            let bytes = new Uint8Array(len);
            let offset = 0;
            for (let i = 0; i < this.chunks.length; i++) {
                bytes.set(this.chunks[i], offset);
                offset += this.chunks[i].length;
            }
            this.chunks = [];
            return bytes;
        }
        /**
         * Start a new fork for length-delimited data like a message
         * or a packed repeated field.
         *
         * Must be joined later with `join()`.
         */
        fork() {
            this.stack.push({ chunks: this.chunks, buf: this.buf });
            this.chunks = [];
            this.buf = [];
            return this;
        }
        /**
         * Join the last fork. Write its length and bytes, then
         * return to the previous state.
         */
        join() {
            // get chunk of fork
            let chunk = this.finish();
            // restore previous state
            let prev = this.stack.pop();
            if (!prev)
                throw new Error("invalid state, fork stack empty");
            this.chunks = prev.chunks;
            this.buf = prev.buf;
            // write length of chunk as varint
            this.uint32(chunk.byteLength);
            return this.raw(chunk);
        }
        /**
         * Writes a tag (field number and wire type).
         *
         * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
         *
         * Generated code should compute the tag ahead of time and call `uint32()`.
         */
        tag(fieldNo, type) {
            return this.uint32(((fieldNo << 3) | type) >>> 0);
        }
        /**
         * Write a chunk of raw bytes.
         */
        raw(chunk) {
            if (this.buf.length) {
                this.chunks.push(new Uint8Array(this.buf));
                this.buf = [];
            }
            this.chunks.push(chunk);
            return this;
        }
        /**
         * Write a `uint32` value, an unsigned 32 bit varint.
         */
        uint32(value) {
            assertUInt32(value);
            // write value as varint 32, inlined for speed
            while (value > 0x7f) {
                this.buf.push((value & 0x7f) | 0x80);
                value = value >>> 7;
            }
            this.buf.push(value);
            return this;
        }
        /**
         * Write a `int32` value, a signed 32 bit varint.
         */
        int32(value) {
            assertInt32(value);
            varint32write(value, this.buf);
            return this;
        }
        /**
         * Write a `bool` value, a variant.
         */
        bool(value) {
            this.buf.push(value ? 1 : 0);
            return this;
        }
        /**
         * Write a `bytes` value, length-delimited arbitrary data.
         */
        bytes(value) {
            this.uint32(value.byteLength); // write length of chunk as varint
            return this.raw(value);
        }
        /**
         * Write a `string` value, length-delimited data converted to UTF-8 text.
         */
        string(value) {
            let chunk = this.textEncoder.encode(value);
            this.uint32(chunk.byteLength); // write length of chunk as varint
            return this.raw(chunk);
        }
        /**
         * Write a `float` value, 32-bit floating point number.
         */
        float(value) {
            assertFloat32(value);
            let chunk = new Uint8Array(4);
            new DataView(chunk.buffer).setFloat32(0, value, true);
            return this.raw(chunk);
        }
        /**
         * Write a `double` value, a 64-bit floating point number.
         */
        double(value) {
            let chunk = new Uint8Array(8);
            new DataView(chunk.buffer).setFloat64(0, value, true);
            return this.raw(chunk);
        }
        /**
         * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
         */
        fixed32(value) {
            assertUInt32(value);
            let chunk = new Uint8Array(4);
            new DataView(chunk.buffer).setUint32(0, value, true);
            return this.raw(chunk);
        }
        /**
         * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
         */
        sfixed32(value) {
            assertInt32(value);
            let chunk = new Uint8Array(4);
            new DataView(chunk.buffer).setInt32(0, value, true);
            return this.raw(chunk);
        }
        /**
         * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
         */
        sint32(value) {
            assertInt32(value);
            // zigzag encode
            value = ((value << 1) ^ (value >> 31)) >>> 0;
            varint32write(value, this.buf);
            return this;
        }
        /**
         * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
         */
        sfixed64(value) {
            let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.enc(value);
            view.setInt32(0, tc.lo, true);
            view.setInt32(4, tc.hi, true);
            return this.raw(chunk);
        }
        /**
         * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
         */
        fixed64(value) {
            let chunk = new Uint8Array(8), view = new DataView(chunk.buffer), tc = protoInt64.uEnc(value);
            view.setInt32(0, tc.lo, true);
            view.setInt32(4, tc.hi, true);
            return this.raw(chunk);
        }
        /**
         * Write a `int64` value, a signed 64-bit varint.
         */
        int64(value) {
            let tc = protoInt64.enc(value);
            varint64write(tc.lo, tc.hi, this.buf);
            return this;
        }
        /**
         * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
         */
        sint64(value) {
            let tc = protoInt64.enc(value), 
            // zigzag encode
            sign = tc.hi >> 31, lo = (tc.lo << 1) ^ sign, hi = ((tc.hi << 1) | (tc.lo >>> 31)) ^ sign;
            varint64write(lo, hi, this.buf);
            return this;
        }
        /**
         * Write a `uint64` value, an unsigned 64-bit varint.
         */
        uint64(value) {
            let tc = protoInt64.uEnc(value);
            varint64write(tc.lo, tc.hi, this.buf);
            return this;
        }
    }
    class BinaryReader {
        constructor(buf, textDecoder) {
            this.varint64 = varint64read; // dirty cast for `this`
            /**
             * Read a `uint32` field, an unsigned 32 bit varint.
             */
            this.uint32 = varint32read; // dirty cast for `this` and access to protected `buf`
            this.buf = buf;
            this.len = buf.length;
            this.pos = 0;
            this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
            this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder();
        }
        /**
         * Reads a tag - field number and wire type.
         */
        tag() {
            let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
            if (fieldNo <= 0 || wireType < 0 || wireType > 5)
                throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
            return [fieldNo, wireType];
        }
        /**
         * Skip one element and return the skipped data.
         *
         * When skipping StartGroup, provide the tags field number to check for
         * matching field number in the EndGroup tag.
         */
        skip(wireType, fieldNo) {
            let start = this.pos;
            switch (wireType) {
                case WireType.Varint:
                    while (this.buf[this.pos++] & 0x80) {
                        // ignore
                    }
                    break;
                // eslint-disable-next-line
                // @ts-ignore TS7029: Fallthrough case in switch
                case WireType.Bit64:
                    this.pos += 4;
                // eslint-disable-next-line
                // @ts-ignore TS7029: Fallthrough case in switch
                case WireType.Bit32:
                    this.pos += 4;
                    break;
                case WireType.LengthDelimited:
                    let len = this.uint32();
                    this.pos += len;
                    break;
                case WireType.StartGroup:
                    for (;;) {
                        const [fn, wt] = this.tag();
                        if (wt === WireType.EndGroup) {
                            if (fieldNo !== undefined && fn !== fieldNo) {
                                throw new Error("invalid end group tag");
                            }
                            break;
                        }
                        this.skip(wt, fn);
                    }
                    break;
                default:
                    throw new Error("cant skip wire type " + wireType);
            }
            this.assertBounds();
            return this.buf.subarray(start, this.pos);
        }
        /**
         * Throws error if position in byte array is out of range.
         */
        assertBounds() {
            if (this.pos > this.len)
                throw new RangeError("premature EOF");
        }
        /**
         * Read a `int32` field, a signed 32 bit varint.
         */
        int32() {
            return this.uint32() | 0;
        }
        /**
         * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
         */
        sint32() {
            let zze = this.uint32();
            // decode zigzag
            return (zze >>> 1) ^ -(zze & 1);
        }
        /**
         * Read a `int64` field, a signed 64-bit varint.
         */
        int64() {
            return protoInt64.dec(...this.varint64());
        }
        /**
         * Read a `uint64` field, an unsigned 64-bit varint.
         */
        uint64() {
            return protoInt64.uDec(...this.varint64());
        }
        /**
         * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
         */
        sint64() {
            let [lo, hi] = this.varint64();
            // decode zig zag
            let s = -(lo & 1);
            lo = ((lo >>> 1) | ((hi & 1) << 31)) ^ s;
            hi = (hi >>> 1) ^ s;
            return protoInt64.dec(lo, hi);
        }
        /**
         * Read a `bool` field, a variant.
         */
        bool() {
            let [lo, hi] = this.varint64();
            return lo !== 0 || hi !== 0;
        }
        /**
         * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
         */
        fixed32() {
            return this.view.getUint32((this.pos += 4) - 4, true);
        }
        /**
         * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
         */
        sfixed32() {
            return this.view.getInt32((this.pos += 4) - 4, true);
        }
        /**
         * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
         */
        fixed64() {
            return protoInt64.uDec(this.sfixed32(), this.sfixed32());
        }
        /**
         * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
         */
        sfixed64() {
            return protoInt64.dec(this.sfixed32(), this.sfixed32());
        }
        /**
         * Read a `float` field, 32-bit floating point number.
         */
        float() {
            return this.view.getFloat32((this.pos += 4) - 4, true);
        }
        /**
         * Read a `double` field, a 64-bit floating point number.
         */
        double() {
            return this.view.getFloat64((this.pos += 8) - 8, true);
        }
        /**
         * Read a `bytes` field, length-delimited arbitrary data.
         */
        bytes() {
            let len = this.uint32(), start = this.pos;
            this.pos += len;
            this.assertBounds();
            return this.buf.subarray(start, start + len);
        }
        /**
         * Read a `string` field, length-delimited data converted to UTF-8 text.
         */
        string() {
            return this.textDecoder.decode(this.bytes());
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create a new extension using the given runtime.
     */
    function makeExtension(runtime, typeName, extendee, field) {
        let fi;
        return {
            typeName,
            extendee,
            get field() {
                if (!fi) {
                    const i = (typeof field == "function" ? field() : field);
                    i.name = typeName.split(".").pop();
                    i.jsonName = `[${typeName}]`;
                    fi = runtime.util.newFieldList([i]).list()[0];
                }
                return fi;
            },
            runtime,
        };
    }
    /**
     * Create a container that allows us to read extension fields into it with the
     * same logic as regular fields.
     */
    function createExtensionContainer(extension) {
        const localName = extension.field.localName;
        const container = Object.create(null);
        container[localName] = initExtensionField(extension);
        return [container, () => container[localName]];
    }
    function initExtensionField(ext) {
        const field = ext.field;
        if (field.repeated) {
            return [];
        }
        if (field.default !== undefined) {
            return field.default;
        }
        switch (field.kind) {
            case "enum":
                return field.T.values[0].no;
            case "scalar":
                return scalarZeroValue(field.T, field.L);
            case "message":
                // eslint-disable-next-line no-case-declarations
                const T = field.T, value = new T();
                return T.fieldWrapper ? T.fieldWrapper.unwrapField(value) : value;
            case "map":
                throw "map fields are not allowed to be extensions";
        }
    }
    /**
     * Helper to filter unknown fields, optimized based on field type.
     */
    function filterUnknownFields(unknownFields, field) {
        if (!field.repeated && (field.kind == "enum" || field.kind == "scalar")) {
            // singular scalar fields do not merge, we pick the last
            for (let i = unknownFields.length - 1; i >= 0; --i) {
                if (unknownFields[i].no == field.no) {
                    return [unknownFields[i]];
                }
            }
            return [];
        }
        return unknownFields.filter((uf) => uf.no === field.no);
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unnecessary-condition, prefer-const */
    // lookup table from base64 character to byte
    let encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    // lookup table from base64 character *code* to byte because lookup by number is fast
    let decTable = [];
    for (let i = 0; i < encTable.length; i++)
        decTable[encTable[i].charCodeAt(0)] = i;
    // support base64url variants
    decTable["-".charCodeAt(0)] = encTable.indexOf("+");
    decTable["_".charCodeAt(0)] = encTable.indexOf("/");
    const protoBase64 = {
        /**
         * Decodes a base64 string to a byte array.
         *
         * - ignores white-space, including line breaks and tabs
         * - allows inner padding (can decode concatenated base64 strings)
         * - does not require padding
         * - understands base64url encoding:
         *   "-" instead of "+",
         *   "_" instead of "/",
         *   no padding
         */
        dec(base64Str) {
            // estimate byte size, not accounting for inner padding and whitespace
            let es = (base64Str.length * 3) / 4;
            if (base64Str[base64Str.length - 2] == "=")
                es -= 2;
            else if (base64Str[base64Str.length - 1] == "=")
                es -= 1;
            let bytes = new Uint8Array(es), bytePos = 0, // position in byte array
            groupPos = 0, // position in base64 group
            b, // current byte
            p = 0; // previous byte
            for (let i = 0; i < base64Str.length; i++) {
                b = decTable[base64Str.charCodeAt(i)];
                if (b === undefined) {
                    switch (base64Str[i]) {
                        // @ts-ignore TS7029: Fallthrough case in switch
                        case "=":
                            groupPos = 0; // reset state when padding found
                        // @ts-ignore TS7029: Fallthrough case in switch
                        case "\n":
                        case "\r":
                        case "\t":
                        case " ":
                            continue; // skip white-space, and padding
                        default:
                            throw Error("invalid base64 string.");
                    }
                }
                switch (groupPos) {
                    case 0:
                        p = b;
                        groupPos = 1;
                        break;
                    case 1:
                        bytes[bytePos++] = (p << 2) | ((b & 48) >> 4);
                        p = b;
                        groupPos = 2;
                        break;
                    case 2:
                        bytes[bytePos++] = ((p & 15) << 4) | ((b & 60) >> 2);
                        p = b;
                        groupPos = 3;
                        break;
                    case 3:
                        bytes[bytePos++] = ((p & 3) << 6) | b;
                        groupPos = 0;
                        break;
                }
            }
            if (groupPos == 1)
                throw Error("invalid base64 string.");
            return bytes.subarray(0, bytePos);
        },
        /**
         * Encode a byte array to a base64 string.
         */
        enc(bytes) {
            let base64 = "", groupPos = 0, // position in base64 group
            b, // current byte
            p = 0; // carry over from previous byte
            for (let i = 0; i < bytes.length; i++) {
                b = bytes[i];
                switch (groupPos) {
                    case 0:
                        base64 += encTable[b >> 2];
                        p = (b & 3) << 4;
                        groupPos = 1;
                        break;
                    case 1:
                        base64 += encTable[p | (b >> 4)];
                        p = (b & 15) << 2;
                        groupPos = 2;
                        break;
                    case 2:
                        base64 += encTable[p | (b >> 6)];
                        base64 += encTable[b & 63];
                        groupPos = 0;
                        break;
                }
            }
            // add output padding
            if (groupPos) {
                base64 += encTable[p];
                base64 += "=";
                if (groupPos == 1)
                    base64 += "=";
            }
            return base64;
        },
    };

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Retrieve an extension value from a message.
     *
     * The function never returns undefined. Use hasExtension() to check whether an
     * extension is set. If the extension is not set, this function returns the
     * default value (if one was specified in the protobuf source), or the zero value
     * (for example `0` for numeric types, `[]` for repeated extension fields, and
     * an empty message instance for message fields).
     *
     * Extensions are stored as unknown fields on a message. To mutate an extension
     * value, make sure to store the new value with setExtension() after mutating.
     *
     * If the extension does not extend the given message, an error is raised.
     */
    function getExtension(message, extension, options) {
        assertExtendee(extension, message);
        const opt = extension.runtime.bin.makeReadOptions(options);
        const ufs = filterUnknownFields(message.getType().runtime.bin.listUnknownFields(message), extension.field);
        const [container, get] = createExtensionContainer(extension);
        for (const uf of ufs) {
            extension.runtime.bin.readField(container, opt.readerFactory(uf.data), extension.field, uf.wireType, opt);
        }
        return get();
    }
    /**
     * Set an extension value on a message. If the message already has a value for
     * this extension, the value is replaced.
     *
     * If the extension does not extend the given message, an error is raised.
     */
    function setExtension(message, extension, value, options) {
        assertExtendee(extension, message);
        const readOpt = extension.runtime.bin.makeReadOptions(options);
        const writeOpt = extension.runtime.bin.makeWriteOptions(options);
        if (hasExtension(message, extension)) {
            const ufs = message
                .getType()
                .runtime.bin.listUnknownFields(message)
                .filter((uf) => uf.no != extension.field.no);
            message.getType().runtime.bin.discardUnknownFields(message);
            for (const uf of ufs) {
                message
                    .getType()
                    .runtime.bin.onUnknownField(message, uf.no, uf.wireType, uf.data);
            }
        }
        const writer = writeOpt.writerFactory();
        let f = extension.field;
        // Implicit presence does not apply to extensions, see https://github.com/protocolbuffers/protobuf/issues/8234
        // We patch the field info to use explicit presence:
        if (!f.opt && !f.repeated && (f.kind == "enum" || f.kind == "scalar")) {
            f = Object.assign(Object.assign({}, extension.field), { opt: true });
        }
        extension.runtime.bin.writeField(f, value, writer, writeOpt);
        const reader = readOpt.readerFactory(writer.finish());
        while (reader.pos < reader.len) {
            const [no, wireType] = reader.tag();
            const data = reader.skip(wireType, no);
            message.getType().runtime.bin.onUnknownField(message, no, wireType, data);
        }
    }
    /**
     * Check whether an extension is set on a message.
     */
    function hasExtension(message, extension) {
        const messageType = message.getType();
        return (extension.extendee.typeName === messageType.typeName &&
            !!messageType.runtime.bin
                .listUnknownFields(message)
                .find((uf) => uf.no == extension.field.no));
    }
    function assertExtendee(extension, message) {
        assert(extension.extendee.typeName == message.getType().typeName, `extension ${extension.typeName} can only be applied to message ${extension.extendee.typeName}`);
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Returns true if the field is set.
     */
    function isFieldSet(field, target) {
        const localName = field.localName;
        if (field.repeated) {
            return target[localName].length > 0;
        }
        if (field.oneof) {
            return target[field.oneof.localName].case === localName; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        }
        switch (field.kind) {
            case "enum":
            case "scalar":
                if (field.opt || field.req) {
                    // explicit presence
                    return target[localName] !== undefined;
                }
                // implicit presence
                if (field.kind == "enum") {
                    return target[localName] !== field.T.values[0].no;
                }
                return !isScalarZeroValue(field.T, target[localName]);
            case "message":
                return target[localName] !== undefined;
            case "map":
                return Object.keys(target[localName]).length > 0; // eslint-disable-line @typescript-eslint/no-unsafe-argument
        }
    }
    /**
     * Resets the field, so that isFieldSet() will return false.
     */
    function clearField(field, target) {
        const localName = field.localName;
        const implicitPresence = !field.opt && !field.req;
        if (field.repeated) {
            target[localName] = [];
        }
        else if (field.oneof) {
            target[field.oneof.localName] = { case: undefined };
        }
        else {
            switch (field.kind) {
                case "map":
                    target[localName] = {};
                    break;
                case "enum":
                    target[localName] = implicitPresence ? field.T.values[0].no : undefined;
                    break;
                case "scalar":
                    target[localName] = implicitPresence
                        ? scalarZeroValue(field.T, field.L)
                        : undefined;
                    break;
                case "message":
                    target[localName] = undefined;
                    break;
            }
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Check whether the given object is any subtype of Message or is a specific
     * Message by passing the type.
     *
     * Just like `instanceof`, `isMessage` narrows the type. The advantage of
     * `isMessage` is that it compares identity by the message type name, not by
     * class identity. This makes it robust against the dual package hazard and
     * similar situations, where the same message is duplicated.
     *
     * This function is _mostly_ equivalent to the `instanceof` operator. For
     * example, `isMessage(foo, MyMessage)` is the same as `foo instanceof MyMessage`,
     * and `isMessage(foo)` is the same as `foo instanceof Message`. In most cases,
     * `isMessage` should be preferred over `instanceof`.
     *
     * However, due to the fact that `isMessage` does not use class identity, there
     * are subtle differences between this function and `instanceof`. Notably,
     * calling `isMessage` on an explicit type of Message will return false.
     */
    function isMessage(arg, type) {
        if (arg === null || typeof arg != "object") {
            return false;
        }
        if (!Object.getOwnPropertyNames(Message.prototype).every((m) => m in arg && typeof arg[m] == "function")) {
            return false;
        }
        const actualType = arg.getType();
        if (actualType === null ||
            typeof actualType != "function" ||
            !("typeName" in actualType) ||
            typeof actualType.typeName != "string") {
            return false;
        }
        return type === undefined ? true : actualType.typeName == type.typeName;
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Wrap a primitive message field value in its corresponding wrapper
     * message. This function is idempotent.
     */
    function wrapField(type, value) {
        if (isMessage(value) || !type.fieldWrapper) {
            return value;
        }
        return type.fieldWrapper.wrapField(value);
    }
    ({
        "google.protobuf.DoubleValue": ScalarType.DOUBLE,
        "google.protobuf.FloatValue": ScalarType.FLOAT,
        "google.protobuf.Int64Value": ScalarType.INT64,
        "google.protobuf.UInt64Value": ScalarType.UINT64,
        "google.protobuf.Int32Value": ScalarType.INT32,
        "google.protobuf.UInt32Value": ScalarType.UINT32,
        "google.protobuf.BoolValue": ScalarType.BOOL,
        "google.protobuf.StringValue": ScalarType.STRING,
        "google.protobuf.BytesValue": ScalarType.BYTES,
    });

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /* eslint-disable no-case-declarations,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */
    // Default options for parsing JSON.
    const jsonReadDefaults = {
        ignoreUnknownFields: false,
    };
    // Default options for serializing to JSON.
    const jsonWriteDefaults = {
        emitDefaultValues: false,
        enumAsInteger: false,
        useProtoFieldName: false,
        prettySpaces: 0,
    };
    function makeReadOptions$1(options) {
        return options ? Object.assign(Object.assign({}, jsonReadDefaults), options) : jsonReadDefaults;
    }
    function makeWriteOptions$1(options) {
        return options ? Object.assign(Object.assign({}, jsonWriteDefaults), options) : jsonWriteDefaults;
    }
    const tokenNull = Symbol();
    const tokenIgnoredUnknownEnum = Symbol();
    function makeJsonFormat() {
        return {
            makeReadOptions: makeReadOptions$1,
            makeWriteOptions: makeWriteOptions$1,
            readMessage(type, json, options, message) {
                if (json == null || Array.isArray(json) || typeof json != "object") {
                    throw new Error(`cannot decode message ${type.typeName} from JSON: ${debugJsonValue(json)}`);
                }
                message = message !== null && message !== void 0 ? message : new type();
                const oneofSeen = new Map();
                const registry = options.typeRegistry;
                for (const [jsonKey, jsonValue] of Object.entries(json)) {
                    const field = type.fields.findJsonName(jsonKey);
                    if (field) {
                        if (field.oneof) {
                            if (jsonValue === null && field.kind == "scalar") {
                                // see conformance test Required.Proto3.JsonInput.OneofFieldNull{First,Second}
                                continue;
                            }
                            const seen = oneofSeen.get(field.oneof);
                            if (seen !== undefined) {
                                throw new Error(`cannot decode message ${type.typeName} from JSON: multiple keys for oneof "${field.oneof.name}" present: "${seen}", "${jsonKey}"`);
                            }
                            oneofSeen.set(field.oneof, jsonKey);
                        }
                        readField$1(message, jsonValue, field, options, type);
                    }
                    else {
                        let found = false;
                        if ((registry === null || registry === void 0 ? void 0 : registry.findExtension) &&
                            jsonKey.startsWith("[") &&
                            jsonKey.endsWith("]")) {
                            const ext = registry.findExtension(jsonKey.substring(1, jsonKey.length - 1));
                            if (ext && ext.extendee.typeName == type.typeName) {
                                found = true;
                                const [container, get] = createExtensionContainer(ext);
                                readField$1(container, jsonValue, ext.field, options, ext);
                                // We pass on the options as BinaryReadOptions/BinaryWriteOptions,
                                // so that users can bring their own binary reader and writer factories
                                // if necessary.
                                setExtension(message, ext, get(), options);
                            }
                        }
                        if (!found && !options.ignoreUnknownFields) {
                            throw new Error(`cannot decode message ${type.typeName} from JSON: key "${jsonKey}" is unknown`);
                        }
                    }
                }
                return message;
            },
            writeMessage(message, options) {
                const type = message.getType();
                const json = {};
                let field;
                try {
                    for (field of type.fields.byNumber()) {
                        if (!isFieldSet(field, message)) {
                            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                            if (field.req) {
                                throw `required field not set`;
                            }
                            if (!options.emitDefaultValues) {
                                continue;
                            }
                            if (!canEmitFieldDefaultValue(field)) {
                                continue;
                            }
                        }
                        const value = field.oneof
                            ? message[field.oneof.localName].value
                            : message[field.localName];
                        const jsonValue = writeField$1(field, value, options);
                        if (jsonValue !== undefined) {
                            json[options.useProtoFieldName ? field.name : field.jsonName] =
                                jsonValue;
                        }
                    }
                    const registry = options.typeRegistry;
                    if (registry === null || registry === void 0 ? void 0 : registry.findExtensionFor) {
                        for (const uf of type.runtime.bin.listUnknownFields(message)) {
                            const ext = registry.findExtensionFor(type.typeName, uf.no);
                            if (ext && hasExtension(message, ext)) {
                                // We pass on the options as BinaryReadOptions, so that users can bring their own
                                // binary reader factory if necessary.
                                const value = getExtension(message, ext, options);
                                const jsonValue = writeField$1(ext.field, value, options);
                                if (jsonValue !== undefined) {
                                    json[ext.field.jsonName] = jsonValue;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    const m = field
                        ? `cannot encode field ${type.typeName}.${field.name} to JSON`
                        : `cannot encode message ${type.typeName} to JSON`;
                    const r = e instanceof Error ? e.message : String(e);
                    throw new Error(m + (r.length > 0 ? `: ${r}` : ""));
                }
                return json;
            },
            readScalar(type, json, longType) {
                // The signature of our internal function has changed. For backwards-
                // compatibility, we support the old form that is part of the public API
                // through the interface JsonFormat.
                return readScalar$1(type, json, longType !== null && longType !== void 0 ? longType : LongType.BIGINT, true);
            },
            writeScalar(type, value, emitDefaultValues) {
                // The signature of our internal function has changed. For backwards-
                // compatibility, we support the old form that is part of the public API
                // through the interface JsonFormat.
                if (value === undefined) {
                    return undefined;
                }
                if (emitDefaultValues || isScalarZeroValue(type, value)) {
                    return writeScalar$1(type, value);
                }
                return undefined;
            },
            debug: debugJsonValue,
        };
    }
    function debugJsonValue(json) {
        if (json === null) {
            return "null";
        }
        switch (typeof json) {
            case "object":
                return Array.isArray(json) ? "array" : "object";
            case "string":
                return json.length > 100 ? "string" : `"${json.split('"').join('\\"')}"`;
            default:
                return String(json);
        }
    }
    // Read a JSON value for a field.
    // The "parentType" argument is only used to provide context in errors.
    function readField$1(target, jsonValue, field, options, parentType) {
        let localName = field.localName;
        if (field.repeated) {
            assert(field.kind != "map");
            if (jsonValue === null) {
                return;
            }
            if (!Array.isArray(jsonValue)) {
                throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`);
            }
            const targetArray = target[localName];
            for (const jsonItem of jsonValue) {
                if (jsonItem === null) {
                    throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonItem)}`);
                }
                switch (field.kind) {
                    case "message":
                        targetArray.push(field.T.fromJson(jsonItem, options));
                        break;
                    case "enum":
                        const enumValue = readEnum(field.T, jsonItem, options.ignoreUnknownFields, true);
                        if (enumValue !== tokenIgnoredUnknownEnum) {
                            targetArray.push(enumValue);
                        }
                        break;
                    case "scalar":
                        try {
                            targetArray.push(readScalar$1(field.T, jsonItem, field.L, true));
                        }
                        catch (e) {
                            let m = `cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonItem)}`;
                            if (e instanceof Error && e.message.length > 0) {
                                m += `: ${e.message}`;
                            }
                            throw new Error(m);
                        }
                        break;
                }
            }
        }
        else if (field.kind == "map") {
            if (jsonValue === null) {
                return;
            }
            if (typeof jsonValue != "object" || Array.isArray(jsonValue)) {
                throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`);
            }
            const targetMap = target[localName];
            for (const [jsonMapKey, jsonMapValue] of Object.entries(jsonValue)) {
                if (jsonMapValue === null) {
                    throw new Error(`cannot decode field ${parentType.typeName}.${field.name} from JSON: map value null`);
                }
                let key;
                try {
                    key = readMapKey(field.K, jsonMapKey);
                }
                catch (e) {
                    let m = `cannot decode map key for field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
                    if (e instanceof Error && e.message.length > 0) {
                        m += `: ${e.message}`;
                    }
                    throw new Error(m);
                }
                switch (field.V.kind) {
                    case "message":
                        targetMap[key] = field.V.T.fromJson(jsonMapValue, options);
                        break;
                    case "enum":
                        const enumValue = readEnum(field.V.T, jsonMapValue, options.ignoreUnknownFields, true);
                        if (enumValue !== tokenIgnoredUnknownEnum) {
                            targetMap[key] = enumValue;
                        }
                        break;
                    case "scalar":
                        try {
                            targetMap[key] = readScalar$1(field.V.T, jsonMapValue, LongType.BIGINT, true);
                        }
                        catch (e) {
                            let m = `cannot decode map value for field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
                            if (e instanceof Error && e.message.length > 0) {
                                m += `: ${e.message}`;
                            }
                            throw new Error(m);
                        }
                        break;
                }
            }
        }
        else {
            if (field.oneof) {
                target = target[field.oneof.localName] = { case: localName };
                localName = "value";
            }
            switch (field.kind) {
                case "message":
                    const messageType = field.T;
                    if (jsonValue === null &&
                        messageType.typeName != "google.protobuf.Value") {
                        return;
                    }
                    let currentValue = target[localName];
                    if (isMessage(currentValue)) {
                        currentValue.fromJson(jsonValue, options);
                    }
                    else {
                        target[localName] = currentValue = messageType.fromJson(jsonValue, options);
                        if (messageType.fieldWrapper && !field.oneof) {
                            target[localName] =
                                messageType.fieldWrapper.unwrapField(currentValue);
                        }
                    }
                    break;
                case "enum":
                    const enumValue = readEnum(field.T, jsonValue, options.ignoreUnknownFields, false);
                    switch (enumValue) {
                        case tokenNull:
                            clearField(field, target);
                            break;
                        case tokenIgnoredUnknownEnum:
                            break;
                        default:
                            target[localName] = enumValue;
                            break;
                    }
                    break;
                case "scalar":
                    try {
                        const scalarValue = readScalar$1(field.T, jsonValue, field.L, false);
                        switch (scalarValue) {
                            case tokenNull:
                                clearField(field, target);
                                break;
                            default:
                                target[localName] = scalarValue;
                                break;
                        }
                    }
                    catch (e) {
                        let m = `cannot decode field ${parentType.typeName}.${field.name} from JSON: ${debugJsonValue(jsonValue)}`;
                        if (e instanceof Error && e.message.length > 0) {
                            m += `: ${e.message}`;
                        }
                        throw new Error(m);
                    }
                    break;
            }
        }
    }
    function readMapKey(type, json) {
        if (type === ScalarType.BOOL) {
            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
            switch (json) {
                case "true":
                    json = true;
                    break;
                case "false":
                    json = false;
                    break;
            }
        }
        return readScalar$1(type, json, LongType.BIGINT, true).toString();
    }
    function readScalar$1(type, json, longType, nullAsZeroValue) {
        if (json === null) {
            if (nullAsZeroValue) {
                return scalarZeroValue(type, longType);
            }
            return tokenNull;
        }
        // every valid case in the switch below returns, and every fall
        // through is regarded as a failure.
        switch (type) {
            // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
            // Either numbers or strings are accepted. Exponent notation is also accepted.
            case ScalarType.DOUBLE:
            case ScalarType.FLOAT:
                if (json === "NaN")
                    return Number.NaN;
                if (json === "Infinity")
                    return Number.POSITIVE_INFINITY;
                if (json === "-Infinity")
                    return Number.NEGATIVE_INFINITY;
                if (json === "") {
                    // empty string is not a number
                    break;
                }
                if (typeof json == "string" && json.trim().length !== json.length) {
                    // extra whitespace
                    break;
                }
                if (typeof json != "string" && typeof json != "number") {
                    break;
                }
                const float = Number(json);
                if (Number.isNaN(float)) {
                    // not a number
                    break;
                }
                if (!Number.isFinite(float)) {
                    // infinity and -infinity are handled by string representation above, so this is an error
                    break;
                }
                if (type == ScalarType.FLOAT)
                    assertFloat32(float);
                return float;
            // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
            case ScalarType.INT32:
            case ScalarType.FIXED32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
            case ScalarType.UINT32:
                let int32;
                if (typeof json == "number")
                    int32 = json;
                else if (typeof json == "string" && json.length > 0) {
                    if (json.trim().length === json.length)
                        int32 = Number(json);
                }
                if (int32 === undefined)
                    break;
                if (type == ScalarType.UINT32 || type == ScalarType.FIXED32)
                    assertUInt32(int32);
                else
                    assertInt32(int32);
                return int32;
            // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                if (typeof json != "number" && typeof json != "string")
                    break;
                const long = protoInt64.parse(json);
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return longType ? long.toString() : long;
            case ScalarType.FIXED64:
            case ScalarType.UINT64:
                if (typeof json != "number" && typeof json != "string")
                    break;
                const uLong = protoInt64.uParse(json);
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return longType ? uLong.toString() : uLong;
            // bool:
            case ScalarType.BOOL:
                if (typeof json !== "boolean")
                    break;
                return json;
            // string:
            case ScalarType.STRING:
                if (typeof json !== "string") {
                    break;
                }
                // A string must always contain UTF-8 encoded or 7-bit ASCII.
                // We validate with encodeURIComponent, which appears to be the fastest widely available option.
                try {
                    encodeURIComponent(json);
                }
                catch (e) {
                    throw new Error("invalid UTF8");
                }
                return json;
            // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
            // Either standard or URL-safe base64 encoding with/without paddings are accepted.
            case ScalarType.BYTES:
                if (json === "")
                    return new Uint8Array(0);
                if (typeof json !== "string")
                    break;
                return protoBase64.dec(json);
        }
        throw new Error();
    }
    function readEnum(type, json, ignoreUnknownFields, nullAsZeroValue) {
        if (json === null) {
            if (type.typeName == "google.protobuf.NullValue") {
                return 0; // google.protobuf.NullValue.NULL_VALUE = 0
            }
            return nullAsZeroValue ? type.values[0].no : tokenNull;
        }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (typeof json) {
            case "number":
                if (Number.isInteger(json)) {
                    return json;
                }
                break;
            case "string":
                const value = type.findName(json);
                if (value !== undefined) {
                    return value.no;
                }
                if (ignoreUnknownFields) {
                    return tokenIgnoredUnknownEnum;
                }
                break;
        }
        throw new Error(`cannot decode enum ${type.typeName} from JSON: ${debugJsonValue(json)}`);
    }
    // Decide whether an unset field should be emitted with JSON write option `emitDefaultValues`
    function canEmitFieldDefaultValue(field) {
        if (field.repeated || field.kind == "map") {
            // maps are {}, repeated fields are []
            return true;
        }
        if (field.oneof) {
            // oneof fields are never emitted
            return false;
        }
        if (field.kind == "message") {
            // singular message field are allowed to emit JSON null, but we do not
            return false;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (field.opt || field.req) {
            // the field uses explicit presence, so we cannot emit a zero value
            return false;
        }
        return true;
    }
    function writeField$1(field, value, options) {
        if (field.kind == "map") {
            assert(typeof value == "object" && value != null);
            const jsonObj = {};
            const entries = Object.entries(value);
            switch (field.V.kind) {
                case "scalar":
                    for (const [entryKey, entryValue] of entries) {
                        jsonObj[entryKey.toString()] = writeScalar$1(field.V.T, entryValue); // JSON standard allows only (double quoted) string as property key
                    }
                    break;
                case "message":
                    for (const [entryKey, entryValue] of entries) {
                        // JSON standard allows only (double quoted) string as property key
                        jsonObj[entryKey.toString()] = entryValue.toJson(options);
                    }
                    break;
                case "enum":
                    const enumType = field.V.T;
                    for (const [entryKey, entryValue] of entries) {
                        // JSON standard allows only (double quoted) string as property key
                        jsonObj[entryKey.toString()] = writeEnum(enumType, entryValue, options.enumAsInteger);
                    }
                    break;
            }
            return options.emitDefaultValues || entries.length > 0
                ? jsonObj
                : undefined;
        }
        if (field.repeated) {
            assert(Array.isArray(value));
            const jsonArr = [];
            switch (field.kind) {
                case "scalar":
                    for (let i = 0; i < value.length; i++) {
                        jsonArr.push(writeScalar$1(field.T, value[i]));
                    }
                    break;
                case "enum":
                    for (let i = 0; i < value.length; i++) {
                        jsonArr.push(writeEnum(field.T, value[i], options.enumAsInteger));
                    }
                    break;
                case "message":
                    for (let i = 0; i < value.length; i++) {
                        jsonArr.push(value[i].toJson(options));
                    }
                    break;
            }
            return options.emitDefaultValues || jsonArr.length > 0
                ? jsonArr
                : undefined;
        }
        switch (field.kind) {
            case "scalar":
                return writeScalar$1(field.T, value);
            case "enum":
                return writeEnum(field.T, value, options.enumAsInteger);
            case "message":
                return wrapField(field.T, value).toJson(options);
        }
    }
    function writeEnum(type, value, enumAsInteger) {
        var _a;
        assert(typeof value == "number");
        if (type.typeName == "google.protobuf.NullValue") {
            return null;
        }
        if (enumAsInteger) {
            return value;
        }
        const val = type.findNumber(value);
        return (_a = val === null || val === void 0 ? void 0 : val.name) !== null && _a !== void 0 ? _a : value; // if we don't know the enum value, just return the number
    }
    function writeScalar$1(type, value) {
        switch (type) {
            // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
            case ScalarType.INT32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
            case ScalarType.FIXED32:
            case ScalarType.UINT32:
                assert(typeof value == "number");
                return value;
            // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
            // Either numbers or strings are accepted. Exponent notation is also accepted.
            case ScalarType.FLOAT:
            // assertFloat32(value);
            case ScalarType.DOUBLE: // eslint-disable-line no-fallthrough
                assert(typeof value == "number");
                if (Number.isNaN(value))
                    return "NaN";
                if (value === Number.POSITIVE_INFINITY)
                    return "Infinity";
                if (value === Number.NEGATIVE_INFINITY)
                    return "-Infinity";
                return value;
            // string:
            case ScalarType.STRING:
                assert(typeof value == "string");
                return value;
            // bool:
            case ScalarType.BOOL:
                assert(typeof value == "boolean");
                return value;
            // JSON value will be a decimal string. Either numbers or strings are accepted.
            case ScalarType.UINT64:
            case ScalarType.FIXED64:
            case ScalarType.INT64:
            case ScalarType.SFIXED64:
            case ScalarType.SINT64:
                assert(typeof value == "bigint" ||
                    typeof value == "string" ||
                    typeof value == "number");
                return value.toString();
            // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
            // Either standard or URL-safe base64 encoding with/without paddings are accepted.
            case ScalarType.BYTES:
                assert(value instanceof Uint8Array);
                return protoBase64.enc(value);
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /* eslint-disable prefer-const,no-case-declarations,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return */
    const unknownFieldsSymbol = Symbol("@bufbuild/protobuf/unknown-fields");
    // Default options for parsing binary data.
    const readDefaults = {
        readUnknownFields: true,
        readerFactory: (bytes) => new BinaryReader(bytes),
    };
    // Default options for serializing binary data.
    const writeDefaults = {
        writeUnknownFields: true,
        writerFactory: () => new BinaryWriter(),
    };
    function makeReadOptions(options) {
        return options ? Object.assign(Object.assign({}, readDefaults), options) : readDefaults;
    }
    function makeWriteOptions(options) {
        return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
    }
    function makeBinaryFormat() {
        return {
            makeReadOptions,
            makeWriteOptions,
            listUnknownFields(message) {
                var _a;
                return (_a = message[unknownFieldsSymbol]) !== null && _a !== void 0 ? _a : [];
            },
            discardUnknownFields(message) {
                delete message[unknownFieldsSymbol];
            },
            writeUnknownFields(message, writer) {
                const m = message;
                const c = m[unknownFieldsSymbol];
                if (c) {
                    for (const f of c) {
                        writer.tag(f.no, f.wireType).raw(f.data);
                    }
                }
            },
            onUnknownField(message, no, wireType, data) {
                const m = message;
                if (!Array.isArray(m[unknownFieldsSymbol])) {
                    m[unknownFieldsSymbol] = [];
                }
                m[unknownFieldsSymbol].push({ no, wireType, data });
            },
            readMessage(message, reader, lengthOrEndTagFieldNo, options, delimitedMessageEncoding) {
                const type = message.getType();
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                const end = delimitedMessageEncoding
                    ? reader.len
                    : reader.pos + lengthOrEndTagFieldNo;
                let fieldNo, wireType;
                while (reader.pos < end) {
                    [fieldNo, wireType] = reader.tag();
                    if (delimitedMessageEncoding === true &&
                        wireType == WireType.EndGroup) {
                        break;
                    }
                    const field = type.fields.find(fieldNo);
                    if (!field) {
                        const data = reader.skip(wireType, fieldNo);
                        if (options.readUnknownFields) {
                            this.onUnknownField(message, fieldNo, wireType, data);
                        }
                        continue;
                    }
                    readField(message, reader, field, wireType, options);
                }
                if (delimitedMessageEncoding && // eslint-disable-line @typescript-eslint/strict-boolean-expressions
                    (wireType != WireType.EndGroup || fieldNo !== lengthOrEndTagFieldNo)) {
                    throw new Error(`invalid end group tag`);
                }
            },
            readField,
            writeMessage(message, writer, options) {
                const type = message.getType();
                for (const field of type.fields.byNumber()) {
                    if (!isFieldSet(field, message)) {
                        if (field.req) {
                            throw new Error(`cannot encode field ${type.typeName}.${field.name} to binary: required field not set`);
                        }
                        continue;
                    }
                    const value = field.oneof
                        ? message[field.oneof.localName].value
                        : message[field.localName];
                    writeField(field, value, writer, options);
                }
                if (options.writeUnknownFields) {
                    this.writeUnknownFields(message, writer);
                }
                return writer;
            },
            writeField(field, value, writer, options) {
                // The behavior of our internal function has changed, it does no longer
                // accept `undefined` values for singular scalar and map.
                // For backwards-compatibility, we support the old form that is part of
                // the public API through the interface BinaryFormat.
                if (value === undefined) {
                    return undefined;
                }
                writeField(field, value, writer, options);
            },
        };
    }
    function readField(target, // eslint-disable-line @typescript-eslint/no-explicit-any -- `any` is the best choice for dynamic access
    reader, field, wireType, options) {
        let { repeated, localName } = field;
        if (field.oneof) {
            target = target[field.oneof.localName];
            if (target.case != localName) {
                delete target.value;
            }
            target.case = localName;
            localName = "value";
        }
        switch (field.kind) {
            case "scalar":
            case "enum":
                const scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
                let read = readScalar;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- acceptable since it's covered by tests
                if (field.kind == "scalar" && field.L > 0) {
                    read = readScalarLTString;
                }
                if (repeated) {
                    let arr = target[localName]; // safe to assume presence of array, oneof cannot contain repeated values
                    const isPacked = wireType == WireType.LengthDelimited &&
                        scalarType != ScalarType.STRING &&
                        scalarType != ScalarType.BYTES;
                    if (isPacked) {
                        let e = reader.uint32() + reader.pos;
                        while (reader.pos < e) {
                            arr.push(read(reader, scalarType));
                        }
                    }
                    else {
                        arr.push(read(reader, scalarType));
                    }
                }
                else {
                    target[localName] = read(reader, scalarType);
                }
                break;
            case "message":
                const messageType = field.T;
                if (repeated) {
                    // safe to assume presence of array, oneof cannot contain repeated values
                    target[localName].push(readMessageField(reader, new messageType(), options, field));
                }
                else {
                    if (isMessage(target[localName])) {
                        readMessageField(reader, target[localName], options, field);
                    }
                    else {
                        target[localName] = readMessageField(reader, new messageType(), options, field);
                        if (messageType.fieldWrapper && !field.oneof && !field.repeated) {
                            target[localName] = messageType.fieldWrapper.unwrapField(target[localName]);
                        }
                    }
                }
                break;
            case "map":
                let [mapKey, mapVal] = readMapEntry(field, reader, options);
                // safe to assume presence of map object, oneof cannot contain repeated values
                target[localName][mapKey] = mapVal;
                break;
        }
    }
    // Read a message, avoiding MessageType.fromBinary() to re-use the
    // BinaryReadOptions and the IBinaryReader.
    function readMessageField(reader, message, options, field) {
        const format = message.getType().runtime.bin;
        const delimited = field === null || field === void 0 ? void 0 : field.delimited;
        format.readMessage(message, reader, delimited ? field.no : reader.uint32(), // eslint-disable-line @typescript-eslint/strict-boolean-expressions
        options, delimited);
        return message;
    }
    // Read a map field, expecting key field = 1, value field = 2
    function readMapEntry(field, reader, options) {
        const length = reader.uint32(), end = reader.pos + length;
        let key, val;
        while (reader.pos < end) {
            const [fieldNo] = reader.tag();
            switch (fieldNo) {
                case 1:
                    key = readScalar(reader, field.K);
                    break;
                case 2:
                    switch (field.V.kind) {
                        case "scalar":
                            val = readScalar(reader, field.V.T);
                            break;
                        case "enum":
                            val = reader.int32();
                            break;
                        case "message":
                            val = readMessageField(reader, new field.V.T(), options, undefined);
                            break;
                    }
                    break;
            }
        }
        if (key === undefined) {
            key = scalarZeroValue(field.K, LongType.BIGINT);
        }
        if (typeof key != "string" && typeof key != "number") {
            key = key.toString();
        }
        if (val === undefined) {
            switch (field.V.kind) {
                case "scalar":
                    val = scalarZeroValue(field.V.T, LongType.BIGINT);
                    break;
                case "enum":
                    val = field.V.T.values[0].no;
                    break;
                case "message":
                    val = new field.V.T();
                    break;
            }
        }
        return [key, val];
    }
    // Read a scalar value, but return 64 bit integral types (int64, uint64,
    // sint64, fixed64, sfixed64) as string instead of bigint.
    function readScalarLTString(reader, type) {
        const v = readScalar(reader, type);
        return typeof v == "bigint" ? v.toString() : v;
    }
    // Does not use scalarTypeInfo() for better performance.
    function readScalar(reader, type) {
        switch (type) {
            case ScalarType.STRING:
                return reader.string();
            case ScalarType.BOOL:
                return reader.bool();
            case ScalarType.DOUBLE:
                return reader.double();
            case ScalarType.FLOAT:
                return reader.float();
            case ScalarType.INT32:
                return reader.int32();
            case ScalarType.INT64:
                return reader.int64();
            case ScalarType.UINT64:
                return reader.uint64();
            case ScalarType.FIXED64:
                return reader.fixed64();
            case ScalarType.BYTES:
                return reader.bytes();
            case ScalarType.FIXED32:
                return reader.fixed32();
            case ScalarType.SFIXED32:
                return reader.sfixed32();
            case ScalarType.SFIXED64:
                return reader.sfixed64();
            case ScalarType.SINT64:
                return reader.sint64();
            case ScalarType.UINT32:
                return reader.uint32();
            case ScalarType.SINT32:
                return reader.sint32();
        }
    }
    function writeField(field, value, writer, options) {
        assert(value !== undefined);
        const repeated = field.repeated;
        switch (field.kind) {
            case "scalar":
            case "enum":
                let scalarType = field.kind == "enum" ? ScalarType.INT32 : field.T;
                if (repeated) {
                    assert(Array.isArray(value));
                    if (field.packed) {
                        writePacked(writer, scalarType, field.no, value);
                    }
                    else {
                        for (const item of value) {
                            writeScalar(writer, scalarType, field.no, item);
                        }
                    }
                }
                else {
                    writeScalar(writer, scalarType, field.no, value);
                }
                break;
            case "message":
                if (repeated) {
                    assert(Array.isArray(value));
                    for (const item of value) {
                        writeMessageField(writer, options, field, item);
                    }
                }
                else {
                    writeMessageField(writer, options, field, value);
                }
                break;
            case "map":
                assert(typeof value == "object" && value != null);
                for (const [key, val] of Object.entries(value)) {
                    writeMapEntry(writer, options, field, key, val);
                }
                break;
        }
    }
    function writeMapEntry(writer, options, field, key, value) {
        writer.tag(field.no, WireType.LengthDelimited);
        writer.fork();
        // javascript only allows number or string for object properties
        // we convert from our representation to the protobuf type
        let keyValue = key;
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- we deliberately handle just the special cases for map keys
        switch (field.K) {
            case ScalarType.INT32:
            case ScalarType.FIXED32:
            case ScalarType.UINT32:
            case ScalarType.SFIXED32:
            case ScalarType.SINT32:
                keyValue = Number.parseInt(key);
                break;
            case ScalarType.BOOL:
                assert(key == "true" || key == "false");
                keyValue = key == "true";
                break;
        }
        // write key, expecting key field number = 1
        writeScalar(writer, field.K, 1, keyValue);
        // write value, expecting value field number = 2
        switch (field.V.kind) {
            case "scalar":
                writeScalar(writer, field.V.T, 2, value);
                break;
            case "enum":
                writeScalar(writer, ScalarType.INT32, 2, value);
                break;
            case "message":
                assert(value !== undefined);
                writer.tag(2, WireType.LengthDelimited).bytes(value.toBinary(options));
                break;
        }
        writer.join();
    }
    // Value must not be undefined
    function writeMessageField(writer, options, field, value) {
        const message = wrapField(field.T, value);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (field.delimited)
            writer
                .tag(field.no, WireType.StartGroup)
                .raw(message.toBinary(options))
                .tag(field.no, WireType.EndGroup);
        else
            writer
                .tag(field.no, WireType.LengthDelimited)
                .bytes(message.toBinary(options));
    }
    function writeScalar(writer, type, fieldNo, value) {
        assert(value !== undefined);
        let [wireType, method] = scalarTypeInfo(type);
        writer.tag(fieldNo, wireType)[method](value);
    }
    function writePacked(writer, type, fieldNo, value) {
        if (!value.length) {
            return;
        }
        writer.tag(fieldNo, WireType.LengthDelimited).fork();
        let [, method] = scalarTypeInfo(type);
        for (let i = 0; i < value.length; i++) {
            writer[method](value[i]);
        }
        writer.join();
    }
    /**
     * Get information for writing a scalar value.
     *
     * Returns tuple:
     * [0]: appropriate WireType
     * [1]: name of the appropriate method of IBinaryWriter
     * [2]: whether the given value is a default value for proto3 semantics
     *
     * If argument `value` is omitted, [2] is always false.
     */
    // TODO replace call-sites writeScalar() and writePacked(), then remove
    function scalarTypeInfo(type) {
        let wireType = WireType.Varint;
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- INT32, UINT32, SINT32 are covered by the defaults
        switch (type) {
            case ScalarType.BYTES:
            case ScalarType.STRING:
                wireType = WireType.LengthDelimited;
                break;
            case ScalarType.DOUBLE:
            case ScalarType.FIXED64:
            case ScalarType.SFIXED64:
                wireType = WireType.Bit64;
                break;
            case ScalarType.FIXED32:
            case ScalarType.SFIXED32:
            case ScalarType.FLOAT:
                wireType = WireType.Bit32;
                break;
        }
        const method = ScalarType[type].toLowerCase();
        return [wireType, method];
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-argument,no-case-declarations */
    function makeUtilCommon() {
        return {
            setEnumType,
            initPartial(source, target) {
                if (source === undefined) {
                    return;
                }
                const type = target.getType();
                for (const member of type.fields.byMember()) {
                    const localName = member.localName, t = target, s = source;
                    if (s[localName] == null) {
                        // TODO if source is a Message instance, we should use isFieldSet() here to support future field presence
                        continue;
                    }
                    switch (member.kind) {
                        case "oneof":
                            const sk = s[localName].case;
                            if (sk === undefined) {
                                continue;
                            }
                            const sourceField = member.findField(sk);
                            let val = s[localName].value;
                            if (sourceField &&
                                sourceField.kind == "message" &&
                                !isMessage(val, sourceField.T)) {
                                val = new sourceField.T(val);
                            }
                            else if (sourceField &&
                                sourceField.kind === "scalar" &&
                                sourceField.T === ScalarType.BYTES) {
                                val = toU8Arr(val);
                            }
                            t[localName] = { case: sk, value: val };
                            break;
                        case "scalar":
                        case "enum":
                            let copy = s[localName];
                            if (member.T === ScalarType.BYTES) {
                                copy = member.repeated
                                    ? copy.map(toU8Arr)
                                    : toU8Arr(copy);
                            }
                            t[localName] = copy;
                            break;
                        case "map":
                            switch (member.V.kind) {
                                case "scalar":
                                case "enum":
                                    if (member.V.T === ScalarType.BYTES) {
                                        for (const [k, v] of Object.entries(s[localName])) {
                                            t[localName][k] = toU8Arr(v);
                                        }
                                    }
                                    else {
                                        Object.assign(t[localName], s[localName]);
                                    }
                                    break;
                                case "message":
                                    const messageType = member.V.T;
                                    for (const k of Object.keys(s[localName])) {
                                        let val = s[localName][k];
                                        if (!messageType.fieldWrapper) {
                                            // We only take partial input for messages that are not a wrapper type.
                                            // For those messages, we recursively normalize the partial input.
                                            val = new messageType(val);
                                        }
                                        t[localName][k] = val;
                                    }
                                    break;
                            }
                            break;
                        case "message":
                            const mt = member.T;
                            if (member.repeated) {
                                t[localName] = s[localName].map((val) => isMessage(val, mt) ? val : new mt(val));
                            }
                            else {
                                const val = s[localName];
                                if (mt.fieldWrapper) {
                                    if (
                                    // We can't use BytesValue.typeName as that will create a circular import
                                    mt.typeName === "google.protobuf.BytesValue") {
                                        t[localName] = toU8Arr(val);
                                    }
                                    else {
                                        t[localName] = val;
                                    }
                                }
                                else {
                                    t[localName] = isMessage(val, mt) ? val : new mt(val);
                                }
                            }
                            break;
                    }
                }
            },
            // TODO use isFieldSet() here to support future field presence
            equals(type, a, b) {
                if (a === b) {
                    return true;
                }
                if (!a || !b) {
                    return false;
                }
                return type.fields.byMember().every((m) => {
                    const va = a[m.localName];
                    const vb = b[m.localName];
                    if (m.repeated) {
                        if (va.length !== vb.length) {
                            return false;
                        }
                        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- repeated fields are never "map"
                        switch (m.kind) {
                            case "message":
                                return va.every((a, i) => m.T.equals(a, vb[i]));
                            case "scalar":
                                return va.every((a, i) => scalarEquals(m.T, a, vb[i]));
                            case "enum":
                                return va.every((a, i) => scalarEquals(ScalarType.INT32, a, vb[i]));
                        }
                        throw new Error(`repeated cannot contain ${m.kind}`);
                    }
                    switch (m.kind) {
                        case "message":
                            let a = va;
                            let b = vb;
                            if (m.T.fieldWrapper) {
                                if (a !== undefined && !isMessage(a)) {
                                    a = m.T.fieldWrapper.wrapField(a);
                                }
                                if (b !== undefined && !isMessage(b)) {
                                    b = m.T.fieldWrapper.wrapField(b);
                                }
                            }
                            return m.T.equals(a, b);
                        case "enum":
                            return scalarEquals(ScalarType.INT32, va, vb);
                        case "scalar":
                            return scalarEquals(m.T, va, vb);
                        case "oneof":
                            if (va.case !== vb.case) {
                                return false;
                            }
                            const s = m.findField(va.case);
                            if (s === undefined) {
                                return true;
                            }
                            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- oneof fields are never "map"
                            switch (s.kind) {
                                case "message":
                                    return s.T.equals(va.value, vb.value);
                                case "enum":
                                    return scalarEquals(ScalarType.INT32, va.value, vb.value);
                                case "scalar":
                                    return scalarEquals(s.T, va.value, vb.value);
                            }
                            throw new Error(`oneof cannot contain ${s.kind}`);
                        case "map":
                            const keys = Object.keys(va).concat(Object.keys(vb));
                            switch (m.V.kind) {
                                case "message":
                                    const messageType = m.V.T;
                                    return keys.every((k) => messageType.equals(va[k], vb[k]));
                                case "enum":
                                    return keys.every((k) => scalarEquals(ScalarType.INT32, va[k], vb[k]));
                                case "scalar":
                                    const scalarType = m.V.T;
                                    return keys.every((k) => scalarEquals(scalarType, va[k], vb[k]));
                            }
                            break;
                    }
                });
            },
            // TODO use isFieldSet() here to support future field presence
            clone(message) {
                const type = message.getType(), target = new type(), any = target;
                for (const member of type.fields.byMember()) {
                    const source = message[member.localName];
                    let copy;
                    if (member.repeated) {
                        copy = source.map(cloneSingularField);
                    }
                    else if (member.kind == "map") {
                        copy = any[member.localName];
                        for (const [key, v] of Object.entries(source)) {
                            copy[key] = cloneSingularField(v);
                        }
                    }
                    else if (member.kind == "oneof") {
                        const f = member.findField(source.case);
                        copy = f
                            ? { case: source.case, value: cloneSingularField(source.value) }
                            : { case: undefined };
                    }
                    else {
                        copy = cloneSingularField(source);
                    }
                    any[member.localName] = copy;
                }
                for (const uf of type.runtime.bin.listUnknownFields(message)) {
                    type.runtime.bin.onUnknownField(any, uf.no, uf.wireType, uf.data);
                }
                return target;
            },
        };
    }
    // clone a single field value - i.e. the element type of repeated fields, the value type of maps
    function cloneSingularField(value) {
        if (value === undefined) {
            return value;
        }
        if (isMessage(value)) {
            return value.clone();
        }
        if (value instanceof Uint8Array) {
            const c = new Uint8Array(value.byteLength);
            c.set(value);
            return c;
        }
        return value;
    }
    // converts any ArrayLike<number> to Uint8Array if necessary.
    function toU8Arr(input) {
        return input instanceof Uint8Array ? input : new Uint8Array(input);
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    function makeProtoRuntime(syntax, newFieldList, initFields) {
        return {
            syntax,
            json: makeJsonFormat(),
            bin: makeBinaryFormat(),
            util: Object.assign(Object.assign({}, makeUtilCommon()), { newFieldList,
                initFields }),
            makeMessageType(typeName, fields, opt) {
                return makeMessageType(this, typeName, fields, opt);
            },
            makeEnum,
            makeEnumType,
            getEnumType,
            makeExtension(typeName, extendee, field) {
                return makeExtension(this, typeName, extendee, field);
            },
        };
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    class InternalFieldList {
        constructor(fields, normalizer) {
            this._fields = fields;
            this._normalizer = normalizer;
        }
        findJsonName(jsonName) {
            if (!this.jsonNames) {
                const t = {};
                for (const f of this.list()) {
                    t[f.jsonName] = t[f.name] = f;
                }
                this.jsonNames = t;
            }
            return this.jsonNames[jsonName];
        }
        find(fieldNo) {
            if (!this.numbers) {
                const t = {};
                for (const f of this.list()) {
                    t[f.no] = f;
                }
                this.numbers = t;
            }
            return this.numbers[fieldNo];
        }
        list() {
            if (!this.all) {
                this.all = this._normalizer(this._fields);
            }
            return this.all;
        }
        byNumber() {
            if (!this.numbersAsc) {
                this.numbersAsc = this.list()
                    .concat()
                    .sort((a, b) => a.no - b.no);
            }
            return this.numbersAsc;
        }
        byMember() {
            if (!this.members) {
                this.members = [];
                const a = this.members;
                let o;
                for (const f of this.list()) {
                    if (f.oneof) {
                        if (f.oneof !== o) {
                            o = f.oneof;
                            a.push(o);
                        }
                    }
                    else {
                        a.push(f);
                    }
                }
            }
            return this.members;
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Returns the name of a protobuf element in generated code.
     *
     * Field names - including oneofs - are converted to lowerCamelCase. For
     * messages, enumerations and services, the package name is stripped from
     * the type name. For nested messages and enumerations, the names are joined
     * with an underscore. For methods, the first character is made lowercase.
     */
    /**
     * Returns the name of a field in generated code.
     */
    function localFieldName(protoName, inOneof) {
        const name = protoCamelCase(protoName);
        if (inOneof) {
            // oneof member names are not properties, but values of the `case` property.
            return name;
        }
        return safeObjectProperty(safeMessageProperty(name));
    }
    /**
     * Returns the name of a oneof group in generated code.
     */
    function localOneofName(protoName) {
        return localFieldName(protoName, false);
    }
    /**
     * Returns the JSON name for a protobuf field, exactly like protoc does.
     */
    const fieldJsonName = protoCamelCase;
    /**
     * Converts snake_case to protoCamelCase according to the convention
     * used by protoc to convert a field name to a JSON name.
     */
    function protoCamelCase(snakeCase) {
        let capNext = false;
        const b = [];
        for (let i = 0; i < snakeCase.length; i++) {
            let c = snakeCase.charAt(i);
            switch (c) {
                case "_":
                    capNext = true;
                    break;
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    b.push(c);
                    capNext = false;
                    break;
                default:
                    if (capNext) {
                        capNext = false;
                        c = c.toUpperCase();
                    }
                    b.push(c);
                    break;
            }
        }
        return b.join("");
    }
    /**
     * Names that cannot be used for object properties because they are reserved
     * by built-in JavaScript properties.
     */
    const reservedObjectProperties = new Set([
        // names reserved by JavaScript
        "constructor",
        "toString",
        "toJSON",
        "valueOf",
    ]);
    /**
     * Names that cannot be used for object properties because they are reserved
     * by the runtime.
     */
    const reservedMessageProperties = new Set([
        // names reserved by the runtime
        "getType",
        "clone",
        "equals",
        "fromBinary",
        "fromJson",
        "fromJsonString",
        "toBinary",
        "toJson",
        "toJsonString",
        // names reserved by the runtime for the future
        "toObject",
    ]);
    const fallback = (name) => `${name}$`;
    /**
     * Will wrap names that are Object prototype properties or names reserved
     * for `Message`s.
     */
    const safeMessageProperty = (name) => {
        if (reservedMessageProperties.has(name)) {
            return fallback(name);
        }
        return name;
    };
    /**
     * Names that cannot be used for object properties because they are reserved
     * by built-in JavaScript properties.
     */
    const safeObjectProperty = (name) => {
        if (reservedObjectProperties.has(name)) {
            return fallback(name);
        }
        return name;
    };

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    class InternalOneofInfo {
        constructor(name) {
            this.kind = "oneof";
            this.repeated = false;
            this.packed = false;
            this.opt = false;
            this.req = false;
            this.default = undefined;
            this.fields = [];
            this.name = name;
            this.localName = localOneofName(name);
        }
        addField(field) {
            assert(field.oneof === this, `field ${field.name} not one of ${this.name}`);
            this.fields.push(field);
        }
        findField(localName) {
            if (!this._lookup) {
                this._lookup = Object.create(null);
                for (let i = 0; i < this.fields.length; i++) {
                    this._lookup[this.fields[i].localName] = this.fields[i];
                }
            }
            return this._lookup[localName];
        }
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Convert a collection of field info to an array of normalized FieldInfo.
     *
     * The argument `packedByDefault` specifies whether fields that do not specify
     * `packed` should be packed (proto3) or unpacked (proto2).
     */
    function normalizeFieldInfos(fieldInfos, packedByDefault) {
        var _a, _b, _c, _d, _e, _f;
        const r = [];
        let o;
        for (const field of typeof fieldInfos == "function"
            ? fieldInfos()
            : fieldInfos) {
            const f = field;
            f.localName = localFieldName(field.name, field.oneof !== undefined);
            f.jsonName = (_a = field.jsonName) !== null && _a !== void 0 ? _a : fieldJsonName(field.name);
            f.repeated = (_b = field.repeated) !== null && _b !== void 0 ? _b : false;
            if (field.kind == "scalar") {
                f.L = (_c = field.L) !== null && _c !== void 0 ? _c : LongType.BIGINT;
            }
            f.delimited = (_d = field.delimited) !== null && _d !== void 0 ? _d : false;
            f.req = (_e = field.req) !== null && _e !== void 0 ? _e : false;
            f.opt = (_f = field.opt) !== null && _f !== void 0 ? _f : false;
            if (field.packed === undefined) {
                {
                    f.packed =
                        field.kind == "enum" ||
                            (field.kind == "scalar" &&
                                field.T != ScalarType.BYTES &&
                                field.T != ScalarType.STRING);
                }
            }
            // We do not surface options at this time
            // f.options = field.options ?? emptyReadonlyObject;
            if (field.oneof !== undefined) {
                const ooname = typeof field.oneof == "string" ? field.oneof : field.oneof.name;
                if (!o || o.name != ooname) {
                    o = new InternalOneofInfo(ooname);
                }
                f.oneof = o;
                o.addField(f);
            }
            r.push(f);
        }
        return r;
    }

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Provides functionality for messages defined with the proto3 syntax.
     */
    const proto3 = makeProtoRuntime("proto3", (fields) => {
        return new InternalFieldList(fields, (source) => normalizeFieldInfos(source));
    }, 
    // TODO merge with proto2 and initExtensionField, also see initPartial, equals, clone
    (target) => {
        for (const member of target.getType().fields.byMember()) {
            if (member.opt) {
                continue;
            }
            const name = member.localName, t = target;
            if (member.repeated) {
                t[name] = [];
                continue;
            }
            switch (member.kind) {
                case "oneof":
                    t[name] = { case: undefined };
                    break;
                case "enum":
                    t[name] = 0;
                    break;
                case "map":
                    t[name] = {};
                    break;
                case "scalar":
                    t[name] = scalarZeroValue(member.T, member.L);
                    break;
            }
        }
    });

    // Copyright 2021-2024 Buf Technologies, Inc.
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * MethodKind represents the four method types that can be declared in
     * protobuf with the `stream` keyword:
     *
     * 1. Unary:           rpc (Input) returns (Output)
     * 2. ServerStreaming: rpc (Input) returns (stream Output)
     * 3. ClientStreaming: rpc (stream Input) returns (Output)
     * 4. BiDiStreaming:   rpc (stream Input) returns (stream Output)
     */
    var MethodKind;
    (function (MethodKind) {
        MethodKind[MethodKind["Unary"] = 0] = "Unary";
        MethodKind[MethodKind["ServerStreaming"] = 1] = "ServerStreaming";
        MethodKind[MethodKind["ClientStreaming"] = 2] = "ClientStreaming";
        MethodKind[MethodKind["BiDiStreaming"] = 3] = "BiDiStreaming";
    })(MethodKind || (MethodKind = {}));
    /**
     * Is this method side-effect-free (or safe in HTTP parlance), or just
     * idempotent, or neither? HTTP based RPC implementation may choose GET verb
     * for safe methods, and PUT verb for idempotent methods instead of the
     * default POST.
     *
     * This enum matches the protobuf enum google.protobuf.MethodOptions.IdempotencyLevel,
     * defined in the well-known type google/protobuf/descriptor.proto, but
     * drops UNKNOWN.
     */
    var MethodIdempotency;
    (function (MethodIdempotency) {
        /**
         * Idempotent, no side effects.
         */
        MethodIdempotency[MethodIdempotency["NoSideEffects"] = 1] = "NoSideEffects";
        /**
         * Idempotent, but may have side effects.
         */
        MethodIdempotency[MethodIdempotency["Idempotent"] = 2] = "Idempotent";
    })(MethodIdempotency || (MethodIdempotency = {}));

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Connect represents categories of errors as codes, and each code maps to a
     * specific HTTP status code. The codes and their semantics were chosen to
     * match gRPC. Only the codes below are valid — there are no user-defined
     * codes.
     *
     * See the specification at https://connectrpc.com/docs/protocol#error-codes
     * for details.
     */
    var Code;
    (function (Code) {
        /**
         * Canceled, usually be the user
         */
        Code[Code["Canceled"] = 1] = "Canceled";
        /**
         * Unknown error
         */
        Code[Code["Unknown"] = 2] = "Unknown";
        /**
         * Argument invalid regardless of system state
         */
        Code[Code["InvalidArgument"] = 3] = "InvalidArgument";
        /**
         * Operation expired, may or may not have completed.
         */
        Code[Code["DeadlineExceeded"] = 4] = "DeadlineExceeded";
        /**
         * Entity not found.
         */
        Code[Code["NotFound"] = 5] = "NotFound";
        /**
         * Entity already exists.
         */
        Code[Code["AlreadyExists"] = 6] = "AlreadyExists";
        /**
         * Operation not authorized.
         */
        Code[Code["PermissionDenied"] = 7] = "PermissionDenied";
        /**
         * Quota exhausted.
         */
        Code[Code["ResourceExhausted"] = 8] = "ResourceExhausted";
        /**
         * Argument invalid in current system state.
         */
        Code[Code["FailedPrecondition"] = 9] = "FailedPrecondition";
        /**
         * Operation aborted.
         */
        Code[Code["Aborted"] = 10] = "Aborted";
        /**
         * Out of bounds, use instead of FailedPrecondition.
         */
        Code[Code["OutOfRange"] = 11] = "OutOfRange";
        /**
         * Operation not implemented or disabled.
         */
        Code[Code["Unimplemented"] = 12] = "Unimplemented";
        /**
         * Internal error, reserved for "serious errors".
         */
        Code[Code["Internal"] = 13] = "Internal";
        /**
         * Unavailable, client should back off and retry.
         */
        Code[Code["Unavailable"] = 14] = "Unavailable";
        /**
         * Unrecoverable data loss or corruption.
         */
        Code[Code["DataLoss"] = 15] = "DataLoss";
        /**
         * Request isn't authenticated.
         */
        Code[Code["Unauthenticated"] = 16] = "Unauthenticated";
    })(Code || (Code = {}));

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * codeToString returns the string representation of a Code.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function codeToString(value) {
        const name = Code[value];
        if (typeof name != "string") {
            return value.toString();
        }
        return (name[0].toLowerCase() +
            name.substring(1).replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()));
    }
    let stringToCode;
    /**
     * codeFromString parses the string representation of a Code in snake_case.
     * For example, the string "permission_denied" parses into Code.PermissionDenied.
     *
     * If the given string cannot be parsed, the function returns undefined.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function codeFromString(value) {
        if (!stringToCode) {
            stringToCode = {};
            for (const value of Object.values(Code)) {
                if (typeof value == "string") {
                    continue;
                }
                stringToCode[codeToString(value)] = value;
            }
        }
        return stringToCode[value];
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * ConnectError captures four pieces of information: a Code, an error
     * message, an optional cause of the error, and an optional collection of
     * arbitrary Protobuf messages called  "details".
     *
     * Because developer tools typically show just the error message, we prefix
     * it with the status code, so that the most important information is always
     * visible immediately.
     *
     * Error details are wrapped with google.protobuf.Any on the wire, so that
     * a server or middleware can attach arbitrary data to an error. Use the
     * method findDetails() to retrieve the details.
     */
    class ConnectError extends Error {
        /**
         * Create a new ConnectError.
         * If no code is provided, code "unknown" is used.
         * Outgoing details are only relevant for the server side - a service may
         * raise an error with details, and it is up to the protocol implementation
         * to encode and send the details along with error.
         */
        constructor(message, code = Code.Unknown, metadata, outgoingDetails, cause) {
            super(createMessage(message, code));
            this.name = "ConnectError";
            // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
            Object.setPrototypeOf(this, new.target.prototype);
            this.rawMessage = message;
            this.code = code;
            this.metadata = new Headers(metadata !== null && metadata !== void 0 ? metadata : {});
            this.details = outgoingDetails !== null && outgoingDetails !== void 0 ? outgoingDetails : [];
            this.cause = cause;
        }
        /**
         * Convert any value - typically a caught error into a ConnectError,
         * following these rules:
         * - If the value is already a ConnectError, return it as is.
         * - If the value is an AbortError from the fetch API, return the message
         *   of the AbortError with code Canceled.
         * - For other Errors, return the error message with code Unknown by default.
         * - For other values, return the values String representation as a message,
         *   with the code Unknown by default.
         * The original value will be used for the "cause" property for the new
         * ConnectError.
         */
        static from(reason, code = Code.Unknown) {
            if (reason instanceof ConnectError) {
                return reason;
            }
            if (reason instanceof Error) {
                if (reason.name == "AbortError") {
                    // Fetch requests can only be canceled with an AbortController.
                    // We detect that condition by looking at the name of the raised
                    // error object, and translate to the appropriate status code.
                    return new ConnectError(reason.message, Code.Canceled);
                }
                return new ConnectError(reason.message, code, undefined, undefined, reason);
            }
            return new ConnectError(String(reason), code, undefined, undefined, reason);
        }
        static [Symbol.hasInstance](v) {
            if (!(v instanceof Error)) {
                return false;
            }
            if (Object.getPrototypeOf(v) === ConnectError.prototype) {
                return true;
            }
            return (v.name === "ConnectError" &&
                "code" in v &&
                typeof v.code === "number" &&
                "metadata" in v &&
                "details" in v &&
                Array.isArray(v.details) &&
                "rawMessage" in v &&
                typeof v.rawMessage == "string" &&
                "cause" in v);
        }
        findDetails(typeOrRegistry) {
            const registry = "typeName" in typeOrRegistry
                ? {
                    findMessage: (typeName) => typeName === typeOrRegistry.typeName ? typeOrRegistry : undefined,
                }
                : typeOrRegistry;
            const details = [];
            for (const data of this.details) {
                if ("getType" in data) {
                    if (registry.findMessage(data.getType().typeName)) {
                        details.push(data);
                    }
                    continue;
                }
                const type = registry.findMessage(data.type);
                if (type) {
                    try {
                        details.push(type.fromBinary(data.value));
                    }
                    catch (_) {
                        // We silently give up if we are unable to parse the detail, because
                        // that appears to be the least worst behavior.
                        // It is very unlikely that a user surrounds a catch body handling the
                        // error with another try-catch statement, and we do not want to
                        // recommend doing so.
                    }
                }
            }
            return details;
        }
    }
    /**
     * Create an error message, prefixing the given code.
     */
    function createMessage(message, code) {
        return message.length
            ? `[${codeToString(code)}] ${message}`
            : `[${codeToString(code)}]`;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Merge two or more Headers objects by appending all fields from
     * all inputs to a new Headers object.
     */
    function appendHeaders(...headers) {
        const h = new Headers();
        for (const e of headers) {
            e.forEach((value, key) => {
                h.append(key, value);
            });
        }
        return h;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create any client for the given service.
     *
     * The given createMethod function is called for each method definition
     * of the service. The function it returns is added to the client object
     * as a method.
     */
    function makeAnyClient(service, createMethod) {
        const client = {};
        for (const [localName, methodInfo] of Object.entries(service.methods)) {
            const method = createMethod(Object.assign(Object.assign({}, methodInfo), { localName,
                service }));
            if (method != null) {
                client[localName] = method;
            }
        }
        return client;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * compressedFlag indicates that the data in a EnvelopedMessage is
     * compressed. It has the same meaning in the gRPC-Web, gRPC-HTTP2,
     * and Connect protocols.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    const compressedFlag = 0b00000001;

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create a WHATWG ReadableStream of enveloped messages from a ReadableStream
     * of bytes.
     *
     * Ideally, this would simply be a TransformStream, but ReadableStream.pipeThrough
     * does not have the necessary availability at this time.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function createEnvelopeReadableStream(stream) {
        let reader;
        let buffer = new Uint8Array(0);
        function append(chunk) {
            const n = new Uint8Array(buffer.length + chunk.length);
            n.set(buffer);
            n.set(chunk, buffer.length);
            buffer = n;
        }
        return new ReadableStream({
            start() {
                reader = stream.getReader();
            },
            async pull(controller) {
                let header = undefined;
                for (;;) {
                    if (header === undefined && buffer.byteLength >= 5) {
                        let length = 0;
                        for (let i = 1; i < 5; i++) {
                            length = (length << 8) + buffer[i];
                        }
                        header = { flags: buffer[0], length };
                    }
                    if (header !== undefined && buffer.byteLength >= header.length + 5) {
                        break;
                    }
                    const result = await reader.read();
                    if (result.done) {
                        break;
                    }
                    append(result.value);
                }
                if (header === undefined) {
                    if (buffer.byteLength == 0) {
                        controller.close();
                        return;
                    }
                    controller.error(new ConnectError("premature end of stream", Code.DataLoss));
                    return;
                }
                const data = buffer.subarray(5, 5 + header.length);
                buffer = buffer.subarray(5 + header.length);
                controller.enqueue({
                    flags: header.flags,
                    data,
                });
            },
        });
    }
    /**
     * Encode a single enveloped message.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function encodeEnvelope(flags, data) {
        const bytes = new Uint8Array(data.length + 5);
        bytes.set(data, 5);
        const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        v.setUint8(0, flags); // first byte is flags
        v.setUint32(1, data.length); // 4 bytes message length
        return bytes;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    var __asyncValues$2 = (undefined && undefined.__asyncValues) || function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };
    var __await$2 = (undefined && undefined.__await) || function (v) { return this instanceof __await$2 ? (this.v = v, this) : new __await$2(v); };
    var __asyncGenerator$2 = (undefined && undefined.__asyncGenerator) || function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
        function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
        function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await$2 ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };
    var __asyncDelegator$1 = (undefined && undefined.__asyncDelegator) || function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await$2(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    };
    /**
     * Create an asynchronous iterable from an array.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    function createAsyncIterable(items) {
        return __asyncGenerator$2(this, arguments, function* createAsyncIterable_1() {
            yield __await$2(yield* __asyncDelegator$1(__asyncValues$2(items)));
        });
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    var __asyncValues$1 = (undefined && undefined.__asyncValues) || function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };
    var __await$1 = (undefined && undefined.__await) || function (v) { return this instanceof __await$1 ? (this.v = v, this) : new __await$1(v); };
    var __asyncDelegator = (undefined && undefined.__asyncDelegator) || function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await$1(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    };
    var __asyncGenerator$1 = (undefined && undefined.__asyncGenerator) || function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
        function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
        function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await$1 ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };
    /**
     * Create a Client for the given service, invoking RPCs through the
     * given transport.
     */
    function createClient(service, transport) {
        return makeAnyClient(service, (method) => {
            switch (method.kind) {
                case MethodKind.Unary:
                    return createUnaryFn(transport, service, method);
                case MethodKind.ServerStreaming:
                    return createServerStreamingFn(transport, service, method);
                case MethodKind.ClientStreaming:
                    return createClientStreamingFn(transport, service, method);
                case MethodKind.BiDiStreaming:
                    return createBiDiStreamingFn(transport, service, method);
                default:
                    return null;
            }
        });
    }
    function createUnaryFn(transport, service, method) {
        return async function (input, options) {
            var _a, _b;
            const response = await transport.unary(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, input, options === null || options === void 0 ? void 0 : options.contextValues);
            (_a = options === null || options === void 0 ? void 0 : options.onHeader) === null || _a === void 0 ? void 0 : _a.call(options, response.header);
            (_b = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _b === void 0 ? void 0 : _b.call(options, response.trailer);
            return response.message;
        };
    }
    function createServerStreamingFn(transport, service, method) {
        return function (input, options) {
            return handleStreamResponse(transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, createAsyncIterable([input]), options === null || options === void 0 ? void 0 : options.contextValues), options);
        };
    }
    function createClientStreamingFn(transport, service, method) {
        return async function (request, options) {
            var _a, e_1, _b, _c;
            var _d, _e;
            const response = await transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, request, options === null || options === void 0 ? void 0 : options.contextValues);
            (_d = options === null || options === void 0 ? void 0 : options.onHeader) === null || _d === void 0 ? void 0 : _d.call(options, response.header);
            let singleMessage;
            let count = 0;
            try {
                for (var _f = true, _g = __asyncValues$1(response.message), _h; _h = await _g.next(), _a = _h.done, !_a; _f = true) {
                    _c = _h.value;
                    _f = false;
                    const message = _c;
                    singleMessage = message;
                    count++;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_a && (_b = _g.return)) await _b.call(_g);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (!singleMessage) {
                throw new ConnectError("protocol error: missing response message", Code.Unimplemented);
            }
            if (count > 1) {
                throw new ConnectError("protocol error: received extra messages for client streaming method", Code.Unimplemented);
            }
            (_e = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _e === void 0 ? void 0 : _e.call(options, response.trailer);
            return singleMessage;
        };
    }
    function createBiDiStreamingFn(transport, service, method) {
        return function (request, options) {
            return handleStreamResponse(transport.stream(service, method, options === null || options === void 0 ? void 0 : options.signal, options === null || options === void 0 ? void 0 : options.timeoutMs, options === null || options === void 0 ? void 0 : options.headers, request, options === null || options === void 0 ? void 0 : options.contextValues), options);
        };
    }
    function handleStreamResponse(stream, options) {
        const it = (function () {
            return __asyncGenerator$1(this, arguments, function* () {
                var _a, _b;
                const response = yield __await$1(stream);
                (_a = options === null || options === void 0 ? void 0 : options.onHeader) === null || _a === void 0 ? void 0 : _a.call(options, response.header);
                yield __await$1(yield* __asyncDelegator(__asyncValues$1(response.message)));
                (_b = options === null || options === void 0 ? void 0 : options.onTrailer) === null || _b === void 0 ? void 0 : _b.call(options, response.trailer);
            });
        })()[Symbol.asyncIterator]();
        // Create a new iterable to omit throw/return.
        return {
            [Symbol.asyncIterator]: () => ({
                next: () => it.next(),
            }),
        };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create an AbortController that is automatically aborted if one of the given
     * signals is aborted.
     *
     * For convenience, the linked AbortSignals can be undefined.
     *
     * If the controller or any of the signals is aborted, all event listeners are
     * removed.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function createLinkedAbortController(...signals) {
        const controller = new AbortController();
        const sa = signals.filter((s) => s !== undefined).concat(controller.signal);
        for (const signal of sa) {
            if (signal.aborted) {
                onAbort.apply(signal);
                break;
            }
            signal.addEventListener("abort", onAbort);
        }
        function onAbort() {
            if (!controller.signal.aborted) {
                controller.abort(getAbortSignalReason(this));
            }
            for (const signal of sa) {
                signal.removeEventListener("abort", onAbort);
            }
        }
        return controller;
    }
    /**
     * Create a deadline signal. The returned object contains an AbortSignal, but
     * also a cleanup function to stop the timer, which must be called once the
     * calling code is no longer interested in the signal.
     *
     * Ideally, we would simply use AbortSignal.timeout(), but it is not widely
     * available yet.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function createDeadlineSignal(timeoutMs) {
        const controller = new AbortController();
        const listener = () => {
            controller.abort(new ConnectError("the operation timed out", Code.DeadlineExceeded));
        };
        let timeoutId;
        if (timeoutMs !== undefined) {
            if (timeoutMs <= 0)
                listener();
            else
                timeoutId = setTimeout(listener, timeoutMs);
        }
        return {
            signal: controller.signal,
            cleanup: () => clearTimeout(timeoutId),
        };
    }
    /**
     * Returns the reason why an AbortSignal was aborted. Returns undefined if the
     * signal has not been aborted.
     *
     * The property AbortSignal.reason is not widely available. This function
     * returns an AbortError if the signal is aborted, but reason is undefined.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function getAbortSignalReason(signal) {
        if (!signal.aborted) {
            return undefined;
        }
        if (signal.reason !== undefined) {
            return signal.reason;
        }
        // AbortSignal.reason is available in Node.js v16, v18, and later,
        // and in all browsers since early 2022.
        const e = new Error("This operation was aborted");
        e.name = "AbortError";
        return e;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * createContextValues creates a new ContextValues.
     */
    function createContextValues() {
        return {
            get(key) {
                return key.id in this ? this[key.id] : key.defaultValue;
            },
            set(key, value) {
                this[key.id] = value;
                return this;
            },
            delete(key) {
                delete this[key.id];
                return this;
            },
        };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Create a URL for the given RPC. This simply adds the qualified
     * service name, a slash, and the method name to the path of the given
     * baseUrl.
     *
     * For example, the baseUri https://example.com and method "Say" from
     * the service example.ElizaService results in:
     * https://example.com/example.ElizaService/Say
     *
     * This format is used by the protocols Connect, gRPC and Twirp.
     *
     * Note that this function also accepts a protocol-relative baseUrl.
     * If given an empty string or "/" as a baseUrl, it returns just the
     * path.
     */
    function createMethodUrl(baseUrl, service, method) {
        const s = typeof service == "string" ? service : service.typeName;
        const m = typeof method == "string" ? method : method.name;
        return baseUrl.toString().replace(/\/?$/, `/${s}/${m}`);
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     *  Takes a partial protobuf messages of the
     *  specified message type as input, and returns full instances.
     */
    function normalize(type, message) {
        return message instanceof type
            ? message
            : new type(message);
    }
    /**
     * Takes an AsyncIterable of partial protobuf messages of the
     * specified message type as input, and yields full instances.
     */
    function normalizeIterable(messageType, input) {
        function transform(result) {
            if (result.done === true) {
                return result;
            }
            return {
                done: result.done,
                value: normalize(messageType, result.value),
            };
        }
        return {
            [Symbol.asyncIterator]() {
                const it = input[Symbol.asyncIterator]();
                const res = {
                    next: () => it.next().then(transform),
                };
                if (it.throw !== undefined) {
                    res.throw = (e) => it.throw(e).then(transform); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                }
                if (it.return !== undefined) {
                    res.return = (v) => it.return(v).then(transform); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                }
                return res;
            },
        };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * applyInterceptors takes the given UnaryFn or ServerStreamingFn, and wraps
     * it with each of the given interceptors, returning a new UnaryFn or
     * ServerStreamingFn.
     */
    function applyInterceptors(next, interceptors) {
        var _a;
        return ((_a = interceptors === null || interceptors === void 0 ? void 0 : interceptors.concat().reverse().reduce(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        (n, i) => i(n), next)) !== null && _a !== void 0 ? _a : next);
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Sets default JSON serialization options for connect-es.
     *
     * With standard protobuf JSON serialization, unknown JSON fields are
     * rejected by default. In connect-es, unknown JSON fields are ignored
     * by default.
     */
    function getJsonOptions(options) {
        var _a;
        const o = Object.assign({}, options);
        (_a = o.ignoreUnknownFields) !== null && _a !== void 0 ? _a : (o.ignoreUnknownFields = true);
        return o;
    }
    /**
     * Returns functions to normalize and serialize the input message
     * of an RPC, and to parse the output message of an RPC.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function createClientMethodSerializers(method, useBinaryFormat, jsonOptions, binaryOptions) {
        const input = useBinaryFormat
            ? createBinarySerialization(method.I, binaryOptions)
            : createJsonSerialization(method.I, jsonOptions);
        const output = useBinaryFormat
            ? createBinarySerialization(method.O, binaryOptions)
            : createJsonSerialization(method.O, jsonOptions);
        return { parse: output.parse, serialize: input.serialize };
    }
    /**
     * Creates a Serialization object for serializing the given protobuf message
     * with the protobuf binary format.
     */
    function createBinarySerialization(messageType, options) {
        return {
            parse(data) {
                try {
                    return messageType.fromBinary(data, options);
                }
                catch (e) {
                    const m = e instanceof Error ? e.message : String(e);
                    throw new ConnectError(`parse binary: ${m}`, Code.Internal);
                }
            },
            serialize(data) {
                try {
                    return data.toBinary(options);
                }
                catch (e) {
                    const m = e instanceof Error ? e.message : String(e);
                    throw new ConnectError(`serialize binary: ${m}`, Code.Internal);
                }
            },
        };
    }
    /**
     * Creates a Serialization object for serializing the given protobuf message
     * with the protobuf canonical JSON encoding.
     *
     * By default, unknown fields are ignored.
     */
    function createJsonSerialization(messageType, options) {
        var _a, _b;
        const textEncoder = (_a = options === null || options === void 0 ? void 0 : options.textEncoder) !== null && _a !== void 0 ? _a : new TextEncoder();
        const textDecoder = (_b = options === null || options === void 0 ? void 0 : options.textDecoder) !== null && _b !== void 0 ? _b : new TextDecoder();
        const o = getJsonOptions(options);
        return {
            parse(data) {
                try {
                    const json = textDecoder.decode(data);
                    return messageType.fromJsonString(json, o);
                }
                catch (e) {
                    throw ConnectError.from(e, Code.InvalidArgument);
                }
            },
            serialize(data) {
                try {
                    const json = data.toJsonString(o);
                    return textEncoder.encode(json);
                }
                catch (e) {
                    throw ConnectError.from(e, Code.Internal);
                }
            },
        };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Regular Expression that matches any valid Connect Content-Type header value.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    const contentTypeRegExp = /^application\/(connect\+)?(?:(json)(?:; ?charset=utf-?8)?|(proto))$/i;
    const contentTypeUnaryProto = "application/proto";
    const contentTypeUnaryJson = "application/json";
    const contentTypeStreamProto = "application/connect+proto";
    const contentTypeStreamJson = "application/connect+json";
    /**
     * Parse a Connect Content-Type header.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function parseContentType(contentType) {
        const match = contentType === null || contentType === void 0 ? void 0 : contentType.match(contentTypeRegExp);
        if (!match) {
            return undefined;
        }
        const stream = !!match[1];
        const binary = !!match[3];
        return { stream, binary };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    /**
     * Parse a Connect error from a JSON value.
     * Will return a ConnectError, and throw the provided fallback if parsing failed.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function errorFromJson(jsonValue, metadata, fallback) {
        var _a;
        if (metadata) {
            new Headers(metadata).forEach((value, key) => fallback.metadata.append(key, value));
        }
        if (typeof jsonValue !== "object" ||
            jsonValue == null ||
            Array.isArray(jsonValue)) {
            throw fallback;
        }
        let code = fallback.code;
        if ("code" in jsonValue && typeof jsonValue.code === "string") {
            code = (_a = codeFromString(jsonValue.code)) !== null && _a !== void 0 ? _a : code;
        }
        const message = jsonValue.message;
        if (message != null && typeof message !== "string") {
            throw fallback;
        }
        const error = new ConnectError(message !== null && message !== void 0 ? message : "", code, metadata);
        if ("details" in jsonValue && Array.isArray(jsonValue.details)) {
            for (const detail of jsonValue.details) {
                if (detail === null ||
                    typeof detail != "object" ||
                    Array.isArray(detail) ||
                    typeof detail.type != "string" ||
                    typeof detail.value != "string") {
                    throw fallback;
                }
                try {
                    error.details.push({
                        type: detail.type,
                        value: protoBase64.dec(detail.value),
                        debug: detail.debug,
                    });
                }
                catch (e) {
                    throw fallback;
                }
            }
        }
        return error;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * endStreamFlag indicates that the data in a EnvelopedMessage
     * is a EndStreamResponse of the Connect protocol.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    const endStreamFlag = 0b00000010;
    /**
     * Parse an EndStreamResponse of the Connect protocol.
     * Throws a ConnectError on malformed input.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function endStreamFromJson(data) {
        const parseErr = new ConnectError("invalid end stream", Code.Unknown);
        let jsonValue;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            jsonValue = JSON.parse(typeof data == "string" ? data : new TextDecoder().decode(data));
        }
        catch (e) {
            throw parseErr;
        }
        if (typeof jsonValue != "object" ||
            jsonValue == null ||
            Array.isArray(jsonValue)) {
            throw parseErr;
        }
        const metadata = new Headers();
        if ("metadata" in jsonValue) {
            if (typeof jsonValue.metadata != "object" ||
                jsonValue.metadata == null ||
                Array.isArray(jsonValue.metadata)) {
                throw parseErr;
            }
            for (const [key, values] of Object.entries(jsonValue.metadata)) {
                if (!Array.isArray(values) ||
                    values.some((value) => typeof value != "string")) {
                    throw parseErr;
                }
                for (const value of values) {
                    metadata.append(key, value);
                }
            }
        }
        const error = "error" in jsonValue && jsonValue.error != null
            ? errorFromJson(jsonValue.error, metadata, parseErr)
            : undefined;
        return { metadata, error };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * @private Internal code, does not follow semantic versioning.
     */
    const headerContentType = "Content-Type";
    const headerUnaryContentLength = "Content-Length";
    const headerUnaryEncoding = "Content-Encoding";
    const headerUnaryAcceptEncoding = "Accept-Encoding";
    const headerTimeout = "Connect-Timeout-Ms";
    const headerProtocolVersion = "Connect-Protocol-Version";

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Determine the Connect error code for the given HTTP status code.
     * See https://connectrpc.com/docs/protocol/#http-to-error-code
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function codeFromHttpStatus(httpStatus) {
        switch (httpStatus) {
            case 400: // Bad Request
                return Code.Internal;
            case 401: // Unauthorized
                return Code.Unauthenticated;
            case 403: // Forbidden
                return Code.PermissionDenied;
            case 404: // Not Found
                return Code.Unimplemented;
            case 429: // Too Many Requests
                return Code.Unavailable;
            case 502: // Bad Gateway
                return Code.Unavailable;
            case 503: // Service Unavailable
                return Code.Unavailable;
            case 504: // Gateway Timeout
                return Code.Unavailable;
            default:
                return Code.Unknown;
        }
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * In unary RPCs, Connect transports trailing metadata as response header
     * fields, prefixed with "trailer-".
     *
     * This function demuxes headers and trailers into two separate Headers
     * objects.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function trailerDemux(header) {
        const h = new Headers(), t = new Headers();
        header.forEach((value, key) => {
            if (key.toLowerCase().startsWith("trailer-")) {
                t.append(key.substring(8), value);
            }
            else {
                h.append(key, value);
            }
        });
        return [h, t];
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * The only know value for the header Connect-Protocol-Version.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    const protocolVersion = "1";

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Creates headers for a Connect request.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function requestHeader(methodKind, useBinaryFormat, timeoutMs, userProvidedHeaders, setUserAgent) {
        const result = new Headers(userProvidedHeaders !== null && userProvidedHeaders !== void 0 ? userProvidedHeaders : {});
        if (timeoutMs !== undefined) {
            result.set(headerTimeout, `${timeoutMs}`);
        }
        result.set(headerContentType, methodKind == MethodKind.Unary
            ? useBinaryFormat
                ? contentTypeUnaryProto
                : contentTypeUnaryJson
            : useBinaryFormat
                ? contentTypeStreamProto
                : contentTypeStreamJson);
        result.set(headerProtocolVersion, protocolVersion);
        return result;
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Validates response status and header for the Connect protocol.
     * Throws a ConnectError if the header indicates an error, or if
     * the content type is unexpected, with the following exception:
     * For unary RPCs with an HTTP error status, this returns an error
     * derived from the HTTP status instead of throwing it, giving an
     * implementation a chance to parse a Connect error from the wire.
     *
     * @private Internal code, does not follow semantic versioning.
     */
    function validateResponse(methodKind, useBinaryFormat, status, headers) {
        const mimeType = headers.get(headerContentType);
        const parsedType = parseContentType(mimeType);
        if (status !== 200) {
            const errorFromStatus = new ConnectError(`HTTP ${status}`, codeFromHttpStatus(status), headers);
            // If parsedType is defined and it is not binary, then this is a unary JSON response
            if (methodKind == MethodKind.Unary && parsedType && !parsedType.binary) {
                return { isUnaryError: true, unaryError: errorFromStatus };
            }
            throw errorFromStatus;
        }
        const allowedContentType = {
            binary: useBinaryFormat,
            stream: methodKind !== MethodKind.Unary,
        };
        if ((parsedType === null || parsedType === void 0 ? void 0 : parsedType.binary) !== allowedContentType.binary ||
            parsedType.stream !== allowedContentType.stream) {
            throw new ConnectError(`unsupported content type ${mimeType}`, parsedType === undefined ? Code.Unknown : Code.Internal, headers);
        }
        return { isUnaryError: false };
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    const contentTypePrefix = "application/";
    function encodeMessageForUrl(message, useBase64) {
        if (useBase64) {
            // TODO(jchadwick-buf): Three regex replaces seems excessive.
            // Can we make protoBase64.enc more flexible?
            return protoBase64
                .enc(message)
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
        }
        else {
            return encodeURIComponent(new TextDecoder().decode(message));
        }
    }
    /**
     * @private Internal code, does not follow semantic versioning.
     */
    function transformConnectPostToGetRequest(request, message, useBase64) {
        let query = `?connect=v${protocolVersion}`;
        const contentType = request.header.get(headerContentType);
        if ((contentType === null || contentType === void 0 ? void 0 : contentType.indexOf(contentTypePrefix)) === 0) {
            query +=
                "&encoding=" +
                    encodeURIComponent(contentType.slice(contentTypePrefix.length));
        }
        const compression = request.header.get(headerUnaryEncoding);
        if (compression !== null && compression !== "identity") {
            query += "&compression=" + encodeURIComponent(compression);
            // Force base64 for compressed payloads.
            useBase64 = true;
        }
        if (useBase64) {
            query += "&base64=1";
        }
        query += "&message=" + encodeMessageForUrl(message, useBase64);
        const url = request.url + query;
        // Omit headers that are not used for unary GET requests.
        const header = new Headers(request.header);
        [
            headerProtocolVersion,
            headerContentType,
            headerUnaryContentLength,
            headerUnaryEncoding,
            headerUnaryAcceptEncoding,
        ].forEach((h) => header.delete(h));
        return Object.assign(Object.assign({}, request), { init: Object.assign(Object.assign({}, request.init), { method: "GET" }), url,
            header });
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Runs a unary method with the given interceptors. Note that this function
     * is only used when implementing a Transport.
     */
    function runUnaryCall(opt) {
        const next = applyInterceptors(opt.next, opt.interceptors);
        const [signal, abort, done] = setupSignal(opt);
        const req = Object.assign(Object.assign({}, opt.req), { message: normalize(opt.req.method.I, opt.req.message), signal });
        return next(req).then((res) => {
            done();
            return res;
        }, abort);
    }
    /**
     * Runs a server-streaming method with the given interceptors. Note that this
     * function is only used when implementing a Transport.
     */
    function runStreamingCall(opt) {
        const next = applyInterceptors(opt.next, opt.interceptors);
        const [signal, abort, done] = setupSignal(opt);
        const req = Object.assign(Object.assign({}, opt.req), { message: normalizeIterable(opt.req.method.I, opt.req.message), signal });
        let doneCalled = false;
        // Call return on the request iterable to indicate
        // that we will no longer consume it and it should
        // cleanup any allocated resources.
        signal.addEventListener("abort", function () {
            var _a, _b;
            const it = opt.req.message[Symbol.asyncIterator]();
            // If the signal is aborted due to an error, we want to throw
            // the error to the request iterator.
            if (!doneCalled) {
                (_a = it.throw) === null || _a === void 0 ? void 0 : _a.call(it, this.reason).catch(() => {
                    // throw returns a promise, which we don't care about.
                    //
                    // Uncaught promises are thrown at sometime/somewhere by the event loop,
                    // this is to ensure error is caught and ignored.
                });
            }
            (_b = it.return) === null || _b === void 0 ? void 0 : _b.call(it).catch(() => {
                // return returns a promise, which we don't care about.
                //
                // Uncaught promises are thrown at sometime/somewhere by the event loop,
                // this is to ensure error is caught and ignored.
            });
        });
        return next(req).then((res) => {
            return Object.assign(Object.assign({}, res), { message: {
                    [Symbol.asyncIterator]() {
                        const it = res.message[Symbol.asyncIterator]();
                        return {
                            next() {
                                return it.next().then((r) => {
                                    if (r.done == true) {
                                        doneCalled = true;
                                        done();
                                    }
                                    return r;
                                }, abort);
                            },
                            // We deliberately omit throw/return.
                        };
                    },
                } });
        }, abort);
    }
    /**
     * Create an AbortSignal for Transport implementations. The signal is available
     * in UnaryRequest and StreamingRequest, and is triggered when the call is
     * aborted (via a timeout or explicit cancellation), errored (e.g. when reading
     * an error from the server from the wire), or finished successfully.
     *
     * Transport implementations can pass the signal to HTTP clients to ensure that
     * there are no unused connections leak.
     *
     * Returns a tuple:
     * [0]: The signal, which is also aborted if the optional deadline is reached.
     * [1]: Function to call if the Transport encountered an error.
     * [2]: Function to call if the Transport finished without an error.
     */
    function setupSignal(opt) {
        const { signal, cleanup } = createDeadlineSignal(opt.timeoutMs);
        const controller = createLinkedAbortController(opt.signal, signal);
        return [
            controller.signal,
            function abort(reason) {
                // We peek at the deadline signal because fetch() will throw an error on
                // abort that discards the signal reason.
                const e = ConnectError.from(signal.aborted ? getAbortSignalReason(signal) : reason);
                controller.abort(e);
                cleanup();
                return Promise.reject(e);
            },
            function done() {
                cleanup();
                controller.abort();
            },
        ];
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    /**
     * Asserts that the fetch API is available.
     */
    function assertFetchApi() {
        try {
            new Headers();
        }
        catch (_) {
            throw new Error("connect-web requires the fetch API. Are you running on an old version of Node.js? Node.js is not supported in Connect for Web - please stay tuned for Connect for Node.");
        }
    }

    // Copyright 2021-2024 The Connect Authors
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    var __await = (undefined && undefined.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); };
    var __asyncGenerator = (undefined && undefined.__asyncGenerator) || function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
        function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
        function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };
    /**
     * Create a Transport for the Connect protocol, which makes unary and
     * server-streaming methods available to web browsers. It uses the fetch
     * API to make HTTP requests.
     */
    function createConnectTransport$1(options) {
        var _a;
        assertFetchApi();
        const useBinaryFormat = (_a = options.useBinaryFormat) !== null && _a !== void 0 ? _a : false;
        return {
            async unary(service, method, signal, timeoutMs, header, message, contextValues) {
                var _a;
                const { serialize, parse } = createClientMethodSerializers(method, useBinaryFormat, options.jsonOptions, options.binaryOptions);
                timeoutMs =
                    timeoutMs === undefined
                        ? options.defaultTimeoutMs
                        : timeoutMs <= 0
                            ? undefined
                            : timeoutMs;
                return await runUnaryCall({
                    interceptors: options.interceptors,
                    signal,
                    timeoutMs,
                    req: {
                        stream: false,
                        service,
                        method,
                        url: createMethodUrl(options.baseUrl, service, method),
                        init: {
                            method: "POST",
                            credentials: (_a = options.credentials) !== null && _a !== void 0 ? _a : "same-origin",
                            redirect: "error",
                            mode: "cors",
                        },
                        header: requestHeader(method.kind, useBinaryFormat, timeoutMs, header),
                        contextValues: contextValues !== null && contextValues !== void 0 ? contextValues : createContextValues(),
                        message,
                    },
                    next: async (req) => {
                        var _a;
                        const useGet = options.useHttpGet === true &&
                            method.idempotency === MethodIdempotency.NoSideEffects;
                        let body = null;
                        if (useGet) {
                            req = transformConnectPostToGetRequest(req, serialize(req.message), useBinaryFormat);
                        }
                        else {
                            body = serialize(req.message);
                        }
                        const fetch = (_a = options.fetch) !== null && _a !== void 0 ? _a : globalThis.fetch;
                        const response = await fetch(req.url, Object.assign(Object.assign({}, req.init), { headers: req.header, signal: req.signal, body }));
                        const { isUnaryError, unaryError } = validateResponse(method.kind, useBinaryFormat, response.status, response.headers);
                        if (isUnaryError) {
                            throw errorFromJson((await response.json()), appendHeaders(...trailerDemux(response.headers)), unaryError);
                        }
                        const [demuxedHeader, demuxedTrailer] = trailerDemux(response.headers);
                        return {
                            stream: false,
                            service,
                            method,
                            header: demuxedHeader,
                            message: useBinaryFormat
                                ? parse(new Uint8Array(await response.arrayBuffer()))
                                : method.O.fromJson((await response.json()), getJsonOptions(options.jsonOptions)),
                            trailer: demuxedTrailer,
                        };
                    },
                });
            },
            async stream(service, method, signal, timeoutMs, header, input, contextValues) {
                var _a;
                const { serialize, parse } = createClientMethodSerializers(method, useBinaryFormat, options.jsonOptions, options.binaryOptions);
                function parseResponseBody(body, trailerTarget, header, signal) {
                    return __asyncGenerator(this, arguments, function* parseResponseBody_1() {
                        const reader = createEnvelopeReadableStream(body).getReader();
                        let endStreamReceived = false;
                        for (;;) {
                            const result = yield __await(reader.read());
                            if (result.done) {
                                break;
                            }
                            const { flags, data } = result.value;
                            if ((flags & compressedFlag) === compressedFlag) {
                                throw new ConnectError(`protocol error: received unsupported compressed output`, Code.Internal);
                            }
                            if ((flags & endStreamFlag) === endStreamFlag) {
                                endStreamReceived = true;
                                const endStream = endStreamFromJson(data);
                                if (endStream.error) {
                                    const error = endStream.error;
                                    header.forEach((value, key) => {
                                        error.metadata.append(key, value);
                                    });
                                    throw error;
                                }
                                endStream.metadata.forEach((value, key) => trailerTarget.set(key, value));
                                continue;
                            }
                            yield yield __await(parse(data));
                        }
                        // Node wil not throw an AbortError on `read` if the
                        // signal is aborted before `getReader` is called.
                        // As a work around we check at the end and throw.
                        //
                        // Ref: https://github.com/nodejs/undici/issues/1940
                        if ("throwIfAborted" in signal) {
                            // We assume that implementations without `throwIfAborted` (old
                            // browsers) do honor aborted signals on `read`.
                            signal.throwIfAborted();
                        }
                        if (!endStreamReceived) {
                            throw "missing EndStreamResponse";
                        }
                    });
                }
                async function createRequestBody(input) {
                    if (method.kind != MethodKind.ServerStreaming) {
                        throw "The fetch API does not support streaming request bodies";
                    }
                    const r = await input[Symbol.asyncIterator]().next();
                    if (r.done == true) {
                        throw "missing request message";
                    }
                    return encodeEnvelope(0, serialize(r.value));
                }
                timeoutMs =
                    timeoutMs === undefined
                        ? options.defaultTimeoutMs
                        : timeoutMs <= 0
                            ? undefined
                            : timeoutMs;
                return await runStreamingCall({
                    interceptors: options.interceptors,
                    timeoutMs,
                    signal,
                    req: {
                        stream: true,
                        service,
                        method,
                        url: createMethodUrl(options.baseUrl, service, method),
                        init: {
                            method: "POST",
                            credentials: (_a = options.credentials) !== null && _a !== void 0 ? _a : "same-origin",
                            redirect: "error",
                            mode: "cors",
                        },
                        header: requestHeader(method.kind, useBinaryFormat, timeoutMs, header),
                        contextValues: contextValues !== null && contextValues !== void 0 ? contextValues : createContextValues(),
                        message: input,
                    },
                    next: async (req) => {
                        var _a;
                        const fetch = (_a = options.fetch) !== null && _a !== void 0 ? _a : globalThis.fetch;
                        const fRes = await fetch(req.url, Object.assign(Object.assign({}, req.init), { headers: req.header, signal: req.signal, body: await createRequestBody(req.message) }));
                        validateResponse(method.kind, useBinaryFormat, fRes.status, fRes.headers);
                        if (fRes.body === null) {
                            throw "missing response body";
                        }
                        const trailer = new Headers();
                        const res = Object.assign(Object.assign({}, req), { header: fRes.headers, trailer, message: parseResponseBody(fRes.body, trailer, fRes.headers, req.signal) });
                        return res;
                    },
                });
            },
        };
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values$1(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values$1 === "function" ? __values$1(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // @generated by protoc-gen-es v1.10.0 with parameter "target=ts,import_extension=.js"
    // @generated from file proto/translation.proto (package translation, syntax proto3)
    /* eslint-disable */
    // @ts-nocheck
    /**
     * GetSenseTranslateRequest 查询指定sense的翻译请求
     *
     * @generated from message translation.GetSenseTranslateRequest
     */
    var GetSenseTranslateRequest = /** @class */ (function (_super) {
        __extends(GetSenseTranslateRequest, _super);
        function GetSenseTranslateRequest(data) {
            var _this = _super.call(this) || this;
            /**
             * 语义sense ID，必填
             *
             * @generated from field: string sense_id = 1;
             */
            _this.senseId = "";
            /**
             * 页码，默认1
             *
             * @generated from field: int32 page = 3;
             */
            _this.page = 0;
            /**
             * 每页大小，默认1000，最大5000
             *
             * @generated from field: int32 page_size = 4;
             */
            _this.pageSize = 0;
            /**
             * 源语言过滤，可选，只返回指定源语言的翻译
             *
             * @generated from field: string from_lang = 5;
             */
            _this.fromLang = "";
            /**
             * 目标语言过滤，可选，只返回指定目标语言的翻译
             *
             * @generated from field: string to_lang = 6;
             */
            _this.toLang = "";
            proto3.util.initPartial(data, _this);
            return _this;
        }
        GetSenseTranslateRequest.fromBinary = function (bytes, options) {
            return new GetSenseTranslateRequest().fromBinary(bytes, options);
        };
        GetSenseTranslateRequest.fromJson = function (jsonValue, options) {
            return new GetSenseTranslateRequest().fromJson(jsonValue, options);
        };
        GetSenseTranslateRequest.fromJsonString = function (jsonString, options) {
            return new GetSenseTranslateRequest().fromJsonString(jsonString, options);
        };
        GetSenseTranslateRequest.equals = function (a, b) {
            return proto3.util.equals(GetSenseTranslateRequest, a, b);
        };
        GetSenseTranslateRequest.runtime = proto3;
        GetSenseTranslateRequest.typeName = "translation.GetSenseTranslateRequest";
        GetSenseTranslateRequest.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
            { no: 3, name: "page", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
            { no: 4, name: "page_size", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
            { no: 5, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 6, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        ]; });
        return GetSenseTranslateRequest;
    }(Message));
    /**
     * TranslateRecord 单条翻译记录
     *
     * @generated from message translation.TranslateRecord
     */
    /** @class */ ((function (_super) {
        __extends(TranslateRecord, _super);
        function TranslateRecord(data) {
            var _this = _super.call(this) || this;
            /**
             * 原文
             *
             * @generated from field: string text = 1;
             */
            _this.text = "";
            /**
             * 译文
             *
             * @generated from field: string translate = 2;
             */
            _this.translate = "";
            proto3.util.initPartial(data, _this);
            return _this;
        }
        TranslateRecord.fromBinary = function (bytes, options) {
            return new TranslateRecord().fromBinary(bytes, options);
        };
        TranslateRecord.fromJson = function (jsonValue, options) {
            return new TranslateRecord().fromJson(jsonValue, options);
        };
        TranslateRecord.fromJsonString = function (jsonString, options) {
            return new TranslateRecord().fromJsonString(jsonString, options);
        };
        TranslateRecord.equals = function (a, b) {
            return proto3.util.equals(TranslateRecord, a, b);
        };
        TranslateRecord.runtime = proto3;
        TranslateRecord.typeName = "translation.TranslateRecord";
        TranslateRecord.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "translate", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        ]; });
        return TranslateRecord;
    })(Message));
    /**
     * GetSenseTranslateResponse 翻译查询响应
     *
     * @generated from message translation.GetSenseTranslateResponse
     */
    var GetSenseTranslateResponse = /** @class */ (function (_super) {
        __extends(GetSenseTranslateResponse, _super);
        function GetSenseTranslateResponse(data) {
            var _this = _super.call(this) || this;
            /**
             * 通用翻译，key是原文，value是译文
             *
             * @generated from field: map<string, string> common = 1;
             */
            _this.common = {};
            /**
             * 个性化翻译，key是原文，value是译文，只有提供fingerprint时才有
             *
             * @generated from field: map<string, string> special = 2;
             */
            _this.special = {};
            /**
             * 当前页码
             *
             * @generated from field: int32 page = 3;
             */
            _this.page = 0;
            /**
             * 每页大小
             *
             * @generated from field: int32 page_size = 4;
             */
            _this.pageSize = 0;
            /**
             * 总记录数
             *
             * @generated from field: int64 total = 5;
             */
            _this.total = protoInt64.zero;
            /**
             * 总页数
             *
             * @generated from field: int64 total_pages = 6;
             */
            _this.totalPages = protoInt64.zero;
            /**
             * 个性化翻译总记录数，只有提供fingerprint时才有
             *
             * @generated from field: int64 special_total = 7;
             */
            _this.specialTotal = protoInt64.zero;
            proto3.util.initPartial(data, _this);
            return _this;
        }
        GetSenseTranslateResponse.fromBinary = function (bytes, options) {
            return new GetSenseTranslateResponse().fromBinary(bytes, options);
        };
        GetSenseTranslateResponse.fromJson = function (jsonValue, options) {
            return new GetSenseTranslateResponse().fromJson(jsonValue, options);
        };
        GetSenseTranslateResponse.fromJsonString = function (jsonString, options) {
            return new GetSenseTranslateResponse().fromJsonString(jsonString, options);
        };
        GetSenseTranslateResponse.equals = function (a, b) {
            return proto3.util.equals(GetSenseTranslateResponse, a, b);
        };
        GetSenseTranslateResponse.runtime = proto3;
        GetSenseTranslateResponse.typeName = "translation.GetSenseTranslateResponse";
        GetSenseTranslateResponse.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "common", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
            { no: 2, name: "special", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
            { no: 3, name: "page", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
            { no: 4, name: "page_size", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
            { no: 5, name: "total", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
            { no: 6, name: "total_pages", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
            { no: 7, name: "special_total", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
        ]; });
        return GetSenseTranslateResponse;
    }(Message));
    /**
     * TextRequest 单个文本翻译请求
     * 用于批量翻译未缓存文本场景
     *
     * @generated from message translation.TextRequest
     */
    var TextRequest = /** @class */ (function (_super) {
        __extends(TextRequest, _super);
        function TextRequest(data) {
            var _this = _super.call(this) || this;
            /**
             * 要翻译的原文
             *
             * @generated from field: string text = 1;
             */
            _this.text = "";
            proto3.util.initPartial(data, _this);
            return _this;
        }
        TextRequest.fromBinary = function (bytes, options) {
            return new TextRequest().fromBinary(bytes, options);
        };
        TextRequest.fromJson = function (jsonValue, options) {
            return new TextRequest().fromJson(jsonValue, options);
        };
        TextRequest.fromJsonString = function (jsonString, options) {
            return new TextRequest().fromJsonString(jsonString, options);
        };
        TextRequest.equals = function (a, b) {
            return proto3.util.equals(TextRequest, a, b);
        };
        TextRequest.runtime = proto3;
        TextRequest.typeName = "translation.TextRequest";
        TextRequest.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        ]; });
        return TextRequest;
    }(Message));
    /**
     * TranslateStreamRequest 流式翻译请求
     *
     * @generated from message translation.TranslateStreamRequest
     */
    var TranslateStreamRequest = /** @class */ (function (_super) {
        __extends(TranslateStreamRequest, _super);
        function TranslateStreamRequest(data) {
            var _this = _super.call(this) || this;
            /**
             * 用户输入文本（可选，用于上下文）
             *
             * @generated from field: string text = 1;
             */
            _this.text = "";
            /**
             * 要查询的sense ID
             *
             * @generated from field: string sense_id = 2;
             */
            _this.senseId = "";
            /**
             * 用户指纹，可选
             *
             * @generated from field: string fingerprint = 3;
             */
            _this.fingerprint = "";
            /**
             * 源语言，可选，用于翻译
             *
             * @generated from field: string from_lang = 4;
             */
            _this.fromLang = "";
            /**
             * 目标语言，必填，用于翻译
             *
             * @generated from field: string to_lang = 5;
             */
            _this.toLang = "";
            /**
             * 源语言过滤，可选，只返回指定源语言的翻译
             *
             * @generated from field: string src_lang = 6;
             */
            _this.srcLang = "";
            /**
             * 目标语言过滤，可选，只返回指定目标语言的翻译（预加载翻译池必填）
             *
             * @generated from field: string dst_lang = 7;
             */
            _this.dstLang = "";
            /**
             * 批量翻译未缓存文本列表
             * JS SDK 批量翻译未命中缓存的文本时使用
             *
             * @generated from field: repeated translation.TextRequest texts = 12;
             */
            _this.texts = [];
            proto3.util.initPartial(data, _this);
            return _this;
        }
        TranslateStreamRequest.fromBinary = function (bytes, options) {
            return new TranslateStreamRequest().fromBinary(bytes, options);
        };
        TranslateStreamRequest.fromJson = function (jsonValue, options) {
            return new TranslateStreamRequest().fromJson(jsonValue, options);
        };
        TranslateStreamRequest.fromJsonString = function (jsonString, options) {
            return new TranslateStreamRequest().fromJsonString(jsonString, options);
        };
        TranslateStreamRequest.equals = function (a, b) {
            return proto3.util.equals(TranslateStreamRequest, a, b);
        };
        TranslateStreamRequest.runtime = proto3;
        TranslateStreamRequest.typeName = "translation.TranslateStreamRequest";
        TranslateStreamRequest.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 3, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 4, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 5, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 6, name: "src_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 7, name: "dst_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 8, name: "request_id", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
            { no: 9, name: "persistent", kind: "scalar", T: 8 /* ScalarType.BOOL */, opt: true },
            { no: 10, name: "is_correction", kind: "scalar", T: 8 /* ScalarType.BOOL */, opt: true },
            { no: 11, name: "corrected_translation", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
            { no: 12, name: "texts", kind: "message", T: TextRequest, repeated: true },
        ]; });
        return TranslateStreamRequest;
    }(Message));
    /**
     * TranslateStreamResponse 流式翻译响应
     *
     * @generated from message translation.TranslateStreamResponse
     */
    var TranslateStreamResponse = /** @class */ (function (_super) {
        __extends(TranslateStreamResponse, _super);
        function TranslateStreamResponse(data) {
            var _this = _super.call(this) || this;
            /**
             * 原始请求文本
             *
             * @generated from field: string original_text = 1;
             */
            _this.originalText = "";
            /**
             * 翻译结果，key是原文，value是译文
             *
             * @generated from field: map<string, string> translation = 2;
             */
            _this.translation = {};
            /**
             * 时间戳
             *
             * @generated from field: int64 timestamp = 3;
             */
            _this.timestamp = protoInt64.zero;
            /**
             * 是否是最后一条消息，完成标识
             *
             * @generated from field: bool finished = 4;
             */
            _this.finished = false;
            /**
             * 当前批次序号，从0开始
             *
             * @generated from field: int32 batch_index = 5;
             */
            _this.batchIndex = 0;
            proto3.util.initPartial(data, _this);
            return _this;
        }
        TranslateStreamResponse.fromBinary = function (bytes, options) {
            return new TranslateStreamResponse().fromBinary(bytes, options);
        };
        TranslateStreamResponse.fromJson = function (jsonValue, options) {
            return new TranslateStreamResponse().fromJson(jsonValue, options);
        };
        TranslateStreamResponse.fromJsonString = function (jsonString, options) {
            return new TranslateStreamResponse().fromJsonString(jsonString, options);
        };
        TranslateStreamResponse.equals = function (a, b) {
            return proto3.util.equals(TranslateStreamResponse, a, b);
        };
        TranslateStreamResponse.runtime = proto3;
        TranslateStreamResponse.typeName = "translation.TranslateStreamResponse";
        TranslateStreamResponse.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "original_text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "translation", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
            { no: 3, name: "timestamp", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
            { no: 4, name: "finished", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
            { no: 5, name: "batch_index", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
            { no: 6, name: "request_id", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
            { no: 7, name: "src_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
            { no: 8, name: "dst_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        ]; });
        return TranslateStreamResponse;
    }(Message));
    /**
     * LLMTranslateRequest 大模型翻译请求
     *
     * @generated from message translation.LLMTranslateRequest
     */
    var LLMTranslateRequest = /** @class */ (function (_super) {
        __extends(LLMTranslateRequest, _super);
        function LLMTranslateRequest(data) {
            var _this = _super.call(this) || this;
            /**
             * 要翻译的原文
             *
             * @generated from field: string text = 1;
             */
            _this.text = "";
            /**
             * 源语言
             *
             * @generated from field: string from_lang = 2;
             */
            _this.fromLang = "";
            /**
             * 目标语言
             *
             * @generated from field: string to_lang = 3;
             */
            _this.toLang = "";
            /**
             * 语义sense ID，可选
             *
             * @generated from field: string sense_id = 4;
             */
            _this.senseId = "";
            /**
             * 用户指纹，可选
             *
             * @generated from field: string fingerprint = 5;
             */
            _this.fingerprint = "";
            proto3.util.initPartial(data, _this);
            return _this;
        }
        LLMTranslateRequest.fromBinary = function (bytes, options) {
            return new LLMTranslateRequest().fromBinary(bytes, options);
        };
        LLMTranslateRequest.fromJson = function (jsonValue, options) {
            return new LLMTranslateRequest().fromJson(jsonValue, options);
        };
        LLMTranslateRequest.fromJsonString = function (jsonString, options) {
            return new LLMTranslateRequest().fromJsonString(jsonString, options);
        };
        LLMTranslateRequest.equals = function (a, b) {
            return proto3.util.equals(LLMTranslateRequest, a, b);
        };
        LLMTranslateRequest.runtime = proto3;
        LLMTranslateRequest.typeName = "translation.LLMTranslateRequest";
        LLMTranslateRequest.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 3, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 4, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 5, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        ]; });
        return LLMTranslateRequest;
    }(Message));
    /**
     * LLMTranslateResponse 大模型翻译响应
     *
     * @generated from message translation.LLMTranslateResponse
     */
    var LLMTranslateResponse = /** @class */ (function (_super) {
        __extends(LLMTranslateResponse, _super);
        function LLMTranslateResponse(data) {
            var _this = _super.call(this) || this;
            /**
             * 翻译结果
             *
             * @generated from field: string translation = 1;
             */
            _this.translation = "";
            /**
             * 源语言
             *
             * @generated from field: string from_lang = 2;
             */
            _this.fromLang = "";
            /**
             * 目标语言
             *
             * @generated from field: string to_lang = 3;
             */
            _this.toLang = "";
            proto3.util.initPartial(data, _this);
            return _this;
        }
        LLMTranslateResponse.fromBinary = function (bytes, options) {
            return new LLMTranslateResponse().fromBinary(bytes, options);
        };
        LLMTranslateResponse.fromJson = function (jsonValue, options) {
            return new LLMTranslateResponse().fromJson(jsonValue, options);
        };
        LLMTranslateResponse.fromJsonString = function (jsonString, options) {
            return new LLMTranslateResponse().fromJsonString(jsonString, options);
        };
        LLMTranslateResponse.equals = function (a, b) {
            return proto3.util.equals(LLMTranslateResponse, a, b);
        };
        LLMTranslateResponse.runtime = proto3;
        LLMTranslateResponse.typeName = "translation.LLMTranslateResponse";
        LLMTranslateResponse.fields = proto3.util.newFieldList(function () { return [
            { no: 1, name: "translation", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
            { no: 3, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        ]; });
        return LLMTranslateResponse;
    }(Message));

    // @generated by protoc-gen-connect-es v1.7.0 with parameter "target=ts,import_extension=.js"
    // @generated from file proto/translation.proto (package translation, syntax proto3)
    /* eslint-disable */
    // @ts-nocheck
    /**
     * TranslationService 翻译服务
     * 提供统一的翻译查询接口，支持普通查询和流式推送
     *
     * @generated from service translation.TranslationService
     */
    var TranslationService = {
        typeName: "translation.TranslationService",
        methods: {
            /**
             * GetSenseTranslate 查询指定sense的翻译，一次性返回所有结果
             * 类似现有的REST API端点
             *
             * @generated from rpc translation.TranslationService.GetSenseTranslate
             */
            getSenseTranslate: {
                name: "GetSenseTranslate",
                I: GetSenseTranslateRequest,
                O: GetSenseTranslateResponse,
                kind: MethodKind.Unary,
            },
            /**
             * TranslateStream 服务器流式推送翻译结果
             * 客户端发送一个查询请求，服务端逐条推送翻译结果
             * 适合大数据量实时推送场景
             *
             * @generated from rpc translation.TranslationService.TranslateStream
             */
            translateStream: {
                name: "TranslateStream",
                I: TranslateStreamRequest,
                O: TranslateStreamResponse,
                kind: MethodKind.ServerStreaming,
            },
            /**
             * TranslateBidirectional 双向流式翻译
             * 客户端可以持续发送多个查询请求，服务端持续推送结果
             * 适合交互式翻译场景
             *
             * @generated from rpc translation.TranslationService.TranslateBidirectional
             */
            translateBidirectional: {
                name: "TranslateBidirectional",
                I: TranslateStreamRequest,
                O: TranslateStreamResponse,
                kind: MethodKind.BiDiStreaming,
            },
            /**
             * LLMTranslate 大模型翻译（一元RPC）
             * 使用配置的大模型翻译provider进行实时翻译
             *
             * @generated from rpc translation.TranslationService.LLMTranslate
             */
            lLMTranslate: {
                name: "LLMTranslate",
                I: LLMTranslateRequest,
                O: LLMTranslateResponse,
                kind: MethodKind.Unary,
            },
            /**
             * LLMTranslateStream 大模型流式翻译
             * 使用配置的大模型翻译provider进行实时翻译，流式推送结果
             *
             * @generated from rpc translation.TranslationService.LLMTranslateStream
             */
            lLMTranslateStream: {
                name: "LLMTranslateStream",
                I: LLMTranslateRequest,
                O: LLMTranslateResponse,
                kind: MethodKind.ServerStreaming,
            },
        }
    };

    /**
     * IndexedDB Storage Wrapper for Translation Cache
     * Provides a more scalable storage solution than localStorage for large translation datasets
     *
     * Features:
     * - Supports storing large amounts of translation data (up to hundreds of MBs)
     * - Asynchronous operations don't block the main thread
     * - Supports indexes for fast lookups
     * - Automatic data expiration support
     */
    var TranslationIndexedDB = /** @class */ (function () {
        function TranslationIndexedDB(options) {
            if (options === void 0) { options = {}; }
            this.db = null;
            this.initPromise = null;
            this.dbName = options.databaseName || 'laker-translation-cache';
            this.dbVersion = options.databaseVersion || 1;
            this.storeName = options.storeName || 'translations';
        }
        /**
         * Initialize the IndexedDB database
         */
        TranslationIndexedDB.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.db)
                        return [2 /*return*/];
                    if (this.initPromise)
                        return [2 /*return*/, this.initPromise];
                    this.initPromise = new Promise(function (resolve, reject) {
                        if (typeof indexedDB === 'undefined') {
                            reject(new Error('IndexedDB is not available in this environment'));
                            return;
                        }
                        var request = indexedDB.open(_this.dbName, _this.dbVersion);
                        request.onerror = function () {
                            console.error('[TranslationIndexedDB] Failed to open database:', request.error);
                            reject(request.error);
                        };
                        request.onsuccess = function () {
                            _this.db = request.result;
                            console.log('[TranslationIndexedDB] Database opened successfully');
                            resolve();
                        };
                        request.onupgradeneeded = function (event) {
                            var db = event.target.result;
                            // Create object store with keyPath
                            if (!db.objectStoreNames.contains(_this.storeName)) {
                                var store = db.createObjectStore(_this.storeName, { keyPath: 'id' });
                                // Create indexes for fast lookups
                                store.createIndex('poolKey', 'poolKey', { unique: false });
                                store.createIndex('text', 'text', { unique: false });
                                store.createIndex('dstLang', 'dstLang', { unique: false });
                                store.createIndex('expiresAt', 'expiresAt', { unique: false });
                                console.log('[TranslationIndexedDB] Object store created with indexes');
                            }
                        };
                    });
                    return [2 /*return*/, this.initPromise];
                });
            });
        };
        /**
         * Get a translation by pool key and text
         */
        TranslationIndexedDB.prototype.get = function (poolKey, text) {
            return __awaiter(this, void 0, void 0, function () {
                var id;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/, null];
                            id = "".concat(poolKey, ":").concat(text);
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.get(id);
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to get translation:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        var entry = request.result;
                                        // Check if entry has expired
                                        if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
                                            // Auto-delete expired entry
                                            _this.delete(poolKey, text).catch(console.error);
                                            resolve(null);
                                        }
                                        else {
                                            resolve(entry || null);
                                        }
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Get all translations for a pool key
         */
        TranslationIndexedDB.prototype.getAllByPoolKey = function (poolKey) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/, []];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                    var store = transaction.objectStore(_this.storeName);
                                    var index = store.index('poolKey');
                                    var request = index.getAll(poolKey);
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to get translations by pool key:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        var entries = request.result;
                                        var now = Date.now();
                                        // Filter out expired entries and delete them
                                        var validEntries = [];
                                        var expiredIds = [];
                                        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                                            var entry = entries_1[_i];
                                            if (entry.expiresAt && entry.expiresAt < now) {
                                                expiredIds.push(entry.id);
                                            }
                                            else {
                                                validEntries.push(entry);
                                            }
                                        }
                                        // Delete expired entries in background
                                        if (expiredIds.length > 0) {
                                            _this.deleteMany(expiredIds).catch(console.error);
                                        }
                                        resolve(validEntries);
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Set a translation entry
         */
        TranslationIndexedDB.prototype.set = function (entry) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.put(entry);
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to set translation:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        resolve();
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Set multiple translation entries at once
         */
        TranslationIndexedDB.prototype.setMany = function (entries) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db || entries.length === 0)
                                return [2 /*return*/];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                                        var entry = entries_2[_i];
                                        store.put(entry);
                                    }
                                    transaction.oncomplete = function () {
                                        resolve();
                                    };
                                    transaction.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to set many translations:', transaction.error);
                                        reject(transaction.error);
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Delete a translation entry
         */
        TranslationIndexedDB.prototype.delete = function (poolKey, text) {
            return __awaiter(this, void 0, void 0, function () {
                var id;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/];
                            id = "".concat(poolKey, ":").concat(text);
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.delete(id);
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to delete translation:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        resolve();
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Delete multiple translation entries
         */
        TranslationIndexedDB.prototype.deleteMany = function (ids) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db || ids.length === 0)
                                return [2 /*return*/];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                                        var id = ids_1[_i];
                                        store.delete(id);
                                    }
                                    transaction.oncomplete = function () {
                                        resolve();
                                    };
                                    transaction.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to delete many translations:', transaction.error);
                                        reject(transaction.error);
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Delete all translations for a pool key
         */
        TranslationIndexedDB.prototype.deleteAllByPoolKey = function (poolKey) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    var index = store.index('poolKey');
                                    var request = index.openCursor(IDBKeyRange.only(poolKey));
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to delete translations by pool key:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function (event) {
                                        var cursor = event.target.result;
                                        if (cursor) {
                                            cursor.delete();
                                            cursor.continue();
                                        }
                                        else {
                                            resolve();
                                        }
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Clear all translations from the database
         */
        TranslationIndexedDB.prototype.clear = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.clear();
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to clear translations:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        resolve();
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Get the count of all entries
         */
        TranslationIndexedDB.prototype.count = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/, 0];
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.count();
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to count translations:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function () {
                                        resolve(request.result);
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Clean up expired entries
         */
        TranslationIndexedDB.prototype.cleanupExpired = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.init()];
                        case 1:
                            _a.sent();
                            if (!this.db)
                                return [2 /*return*/, 0];
                            now = Date.now();
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                    var store = transaction.objectStore(_this.storeName);
                                    var index = store.index('expiresAt');
                                    var range = IDBKeyRange.upperBound(now);
                                    var request = index.openCursor(range);
                                    var deletedCount = 0;
                                    request.onerror = function () {
                                        console.error('[TranslationIndexedDB] Failed to cleanup expired translations:', request.error);
                                        reject(request.error);
                                    };
                                    request.onsuccess = function (event) {
                                        var cursor = event.target.result;
                                        if (cursor) {
                                            cursor.delete();
                                            deletedCount++;
                                            cursor.continue();
                                        }
                                        else {
                                            resolve(deletedCount);
                                        }
                                    };
                                })];
                    }
                });
            });
        };
        /**
         * Close the database connection
         */
        TranslationIndexedDB.prototype.close = function () {
            if (this.db) {
                this.db.close();
                this.db = null;
                this.initPromise = null;
            }
        };
        return TranslationIndexedDB;
    }());
    // Default instance for use across the SDK
    new TranslationIndexedDB();

    var createConnectTransport;
    // Detect environment:
    // - Browser (window exists) → use connect-web
    // - React Native / Expo (navigator.product === 'ReactNative' || global?.__DEV__) → use connect-web
    // - Node.js → use connect-node
    var isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ||
        typeof global$1 !== 'undefined' && global$1.__DEV__ !== undefined;
    var isBrowser = typeof window !== 'undefined' || isReactNative;
    var hasFetch = typeof fetch === 'function';
    // Check if browser already preloaded the transport (for IIFE standalone build)
    if (isBrowser && typeof window !== 'undefined' && window.__LAKER_BROWSER_TRANSPORT) {
        createConnectTransport = window.__LAKER_BROWSER_TRANSPORT;
    }
    else if (hasFetch && isBrowser) {
        // Browser / React Native / Expo environment - use statically imported connect-web
        // User's project already has @connectrpc/connect-web as dependency so it's available
        createConnectTransport = createConnectTransport$1;
    }
    else {
        // Node.js environment - use connect-node (based on Node.js HTTP/2)
        if (typeof require !== 'undefined') {
            (createConnectTransport = require('@connectrpc/connect-node').createConnectTransport);
        }
        else {
            // For pure ESM environments
            import('@connectrpc/connect-node').then(function (mod) {
                createConnectTransport = mod.createConnectTransport;
            });
        }
    }
    var cachedTransports = new Map();
    function getTransportCacheKey(key) {
        // Create a stable cache key based on baseUrl, token presence and interceptor count
        // Interceptors are not compared by value - they are expected to be stable
        return "".concat(key.baseUrl, "|").concat(!!key.token, "|").concat(key.interceptors.length);
    }
    var defaultCrossTabOptions = {
        enabled: false,
        channelName: 'laker-translation-cache',
        storageKeyPrefix: 'laker_translation_',
    };
    /**
     * Automatic template extraction from text containing numeric variables
     * Also handles existing {varName} style templates
     * @param text Original text that may contain numeric variables
     * @returns Template extraction result
     */
    function extractTemplate(text) {
        var result = text;
        var variables = [];
        // First, extract existing {name} style templates
        var braceRegex = /\{([^}]+)\}/g;
        var braceMatch;
        // We need to build a new string with the braces kept, but collect the variable names
        // For existing brace templates, we just extract their names as variables
        while ((braceMatch = braceRegex.exec(result)) !== null) {
            var varName = braceMatch[1];
            if (varName) {
                variables.push(varName);
            }
        }
        // If no existing brace templates, look for numeric variables to convert
        if (variables.length === 0) {
            var numberRegex = /\d+(?:\.\d+)?/g;
            var matches = text.match(numberRegex);
            if (matches && matches.length > 0) {
                var template_1 = text;
                matches.forEach(function (match, index) {
                    var value = match;
                    var varName = "var".concat(index + 1);
                    template_1 = template_1.replace(match, "{".concat(varName, "}"));
                    variables.push(value);
                    result = template_1;
                });
            }
        }
        return {
            isTemplated: variables.length > 0,
            srcTemplate: result,
            dstTemplate: '',
            variables: variables,
        };
    }
    /**
     * Merge template with variables
     * @param template Template with {variable} placeholders
     * @param vars Object mapping variable names to values
     * @returns Merged text with variables substituted
     */
    function mergeTemplate(template, vars) {
        var result = template;
        for (var _i = 0, _a = Object.entries(vars); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            result = result.replace(new RegExp("\\{".concat(key, "\\}"), 'g'), String(value));
        }
        return result;
    }
    // Version from package.json
    var version = '1.6.150';
    var TranslationPool = /** @class */ (function () {
        function TranslationPool(client, senseId, options) {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            this.pools = new Map();
            this.currentFingerprint = null;
            this.currentToLang = null;
            this.broadcastChannel = null;
            this.loading = false;
            this.loadedCombinations = new Set();
            this.currentLanguageVersion = 0;
            this.queuedRequests = [];
            this.pendingResolutions = {};
            this.onTranslationLoaded = null;
            this.onPoolInitialized = null;
            this.onQueueProcessed = null;
            this.onTranslationUpdated = null;
            this.onCompensationTranslate = null;
            this.backgroundUpdateTimer = null;
            this.entryMetadata = new Map();
            this.updateCallback = null;
            // IndexedDB instance for browser cache storage (replaces localStorage for large datasets)
            this.indexedDB = null;
            // Whether to use IndexedDB instead of localStorage (browser only, for large datasets)
            this.useIndexedDB = false;
            this.client = client;
            this.senseId = senseId;
            this.defaultFromLang = options === null || options === void 0 ? void 0 : options.defaultFromLang;
            // Set up crossTabOptions with defaults
            this.crossTabOptions = __assign(__assign({}, defaultCrossTabOptions), options === null || options === void 0 ? void 0 : options.crossTab);
            // Set up backgroundUpdateOptions with defaults
            this.backgroundUpdateOptions = {
                enabled: (_b = (_a = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false,
                intervalMs: (_d = (_c = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _c === void 0 ? void 0 : _c.intervalMs) !== null && _d !== void 0 ? _d : 5 * 60 * 1000,
                batchSize: (_f = (_e = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _e === void 0 ? void 0 : _e.batchSize) !== null && _f !== void 0 ? _f : 50,
                staleThresholdMs: (_h = (_g = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _g === void 0 ? void 0 : _g.staleThresholdMs) !== null && _h !== void 0 ? _h : 24 * 60 * 60 * 1000,
            };
            // Store full options including defaults for API access
            this.options = __assign(__assign({}, options), { senseId: senseId, crossTab: this.crossTabOptions, backgroundUpdate: this.backgroundUpdateOptions });
            this.persistentStorage = options === null || options === void 0 ? void 0 : options.persistentStorage;
            if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
                this.initCrossTabSync();
            }
            // Initialize IndexedDB for browser cache storage (replaces localStorage for large datasets)
            // Only use IndexedDB in browser environment when explicitly enabled or when localStorage is unavailable
            var useIndexedDBOption = (_j = options === null || options === void 0 ? void 0 : options.useIndexedDB) !== null && _j !== void 0 ? _j : false;
            var isBrowserWithIDB = typeof indexedDB !== 'undefined';
            if (useIndexedDBOption && isBrowserWithIDB) {
                this.useIndexedDB = true;
                this.indexedDB = new TranslationIndexedDB({
                    databaseName: "laker-translation-".concat(senseId),
                    storeName: 'translations',
                });
                // Initialize the database and load cache asynchronously
                this.indexedDB.init()
                    .then(function () { return _this.loadFromStorage(); })
                    .catch(function (err) {
                    console.warn('[TranslationPool] Failed to initialize IndexedDB, falling back to localStorage:', err);
                    _this.useIndexedDB = false;
                    _this.indexedDB = null;
                    _this.loadFromStorage();
                });
            }
            else {
                // Load from localStorage synchronously
                this.loadFromStorage();
            }
            this.startBackgroundUpdateChecker();
        }
        /**
         * Add a pending resolution for a persistent stream request
         * Used when request has a request_id that will be matched on the response
         */
        TranslationPool.prototype.addPendingResolver = function (requestId, resolve, reject) {
            this.pendingResolutions[requestId] = {
                resolve: resolve,
                reject: reject,
                resolveList: [resolve],
                rejectList: [reject],
            };
        };
        TranslationPool.prototype.getPoolKey = function (fingerprint, toLang) {
            return "".concat(fingerprint, ":").concat(toLang);
        };
        TranslationPool.prototype.setTranslationLoadedCallback = function (callback) {
            this.onTranslationLoaded = callback;
        };
        TranslationPool.prototype.setPoolInitializedCallback = function (callback) {
            this.onPoolInitialized = callback;
        };
        TranslationPool.prototype.setQueueProcessedCallback = function (callback) {
            this.onQueueProcessed = callback;
        };
        TranslationPool.prototype.setTranslationUpdatedCallback = function (callback) {
            this.onTranslationUpdated = callback;
        };
        /**
         * Set callback to receive compensation translation requests when language is switched
         * After switching to a new language, the callback will be invoked with all texts that exist
         * in the old language pools but are missing in the new language. The integrator should
         * queue these texts for translation to ensure all visible text gets translated.
         * @param callback Callback that receives the list of missing texts and the new target language
         */
        TranslationPool.prototype.setCompensationTranslateCallback = function (callback) {
            this.onCompensationTranslate = callback;
        };
        TranslationPool.prototype.initCrossTabSync = function () {
            var _this = this;
            this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName);
            this.broadcastChannel.onmessage = function (event) {
                var message = event.data;
                if (message.senseId !== _this.senseId) {
                    return;
                }
                switch (message.type) {
                    case 'cache_update':
                        _this.handleCacheUpdate(message);
                        break;
                    case 'cache_clear':
                        _this.handleCacheClear(message);
                        break;
                    case 'request_initial_sync':
                        _this.handleInitialSyncRequest();
                        break;
                }
            };
            this.broadcastChannel.postMessage({
                type: 'request_initial_sync',
                senseId: this.senseId,
            });
        };
        TranslationPool.prototype.loadFromStorage = function () {
            return __awaiter(this, void 0, void 0, function () {
                var prefix, loadPromises, i, key, afterPrefix, colonIndex, fingerprint, toLang;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.useIndexedDB && this.indexedDB)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadFromIndexedDB()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2:
                            if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
                                return [2 /*return*/];
                            }
                            prefix = "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_");
                            loadPromises = [];
                            for (i = 0; i < localStorage.length; i++) {
                                key = localStorage.key(i);
                                if (key && key.startsWith(prefix) && key.includes(':')) {
                                    afterPrefix = key.substring(prefix.length);
                                    colonIndex = afterPrefix.lastIndexOf(':');
                                    if (colonIndex > 0) {
                                        fingerprint = afterPrefix.substring(0, colonIndex);
                                        toLang = afterPrefix.substring(colonIndex + 1);
                                        // Load all cached fingerprints from storage, not just common
                                        loadPromises.push(this.loadLanguageFromStorage(fingerprint, toLang));
                                    }
                                }
                            }
                            return [4 /*yield*/, Promise.all(loadPromises)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Load translations from IndexedDB
         */
        TranslationPool.prototype.loadFromIndexedDB = function () {
            return __awaiter(this, void 0, void 0, function () {
                var allEntries, poolKeyMap, _i, allEntries_1, entry, poolKey, colonIndex, poolData, _loop_1, this_1, _a, poolKeyMap_1, _b, poolKey, data, e_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!this.indexedDB)
                                return [2 /*return*/];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.indexedDB.getAllByPoolKey("".concat(this.senseId, "_"))];
                        case 2:
                            allEntries = _c.sent();
                            poolKeyMap = new Map();
                            for (_i = 0, allEntries_1 = allEntries; _i < allEntries_1.length; _i++) {
                                entry = allEntries_1[_i];
                                poolKey = entry.poolKey;
                                colonIndex = poolKey.indexOf(':');
                                if (colonIndex > 0) {
                                    poolData = poolKeyMap.get(poolKey);
                                    if (!poolData) {
                                        poolData = [];
                                        poolKeyMap.set(poolKey, poolData);
                                    }
                                    poolData.push({ text: entry.text, translation: entry.translation });
                                }
                            }
                            _loop_1 = function (poolKey, data) {
                                var pool = this_1.pools.get(poolKey);
                                if (!pool) {
                                    pool = new Map();
                                    this_1.pools.set(poolKey, pool);
                                }
                                data.forEach(function (_a) {
                                    var text = _a.text, translation = _a.translation;
                                    pool === null || pool === void 0 ? void 0 : pool.set(text, translation);
                                });
                                this_1.loadedCombinations.add(poolKey);
                            };
                            this_1 = this;
                            // Load each pool
                            for (_a = 0, poolKeyMap_1 = poolKeyMap; _a < poolKeyMap_1.length; _a++) {
                                _b = poolKeyMap_1[_a], poolKey = _b[0], data = _b[1];
                                _loop_1(poolKey, data);
                            }
                            console.log("[TranslationPool] Loaded ".concat(allEntries.length, " translations from IndexedDB"));
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _c.sent();
                            console.warn('Failed to load translation cache from IndexedDB:', e_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.loadLanguageFromStorage = function (fingerprint, toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var poolKey, storageKey, stored, data, pool_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            poolKey = this.getPoolKey(fingerprint, toLang);
                            if (!(this.useIndexedDB && this.indexedDB)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadLanguageFromIndexedDB(fingerprint, toLang)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                        case 2:
                            storageKey = this.getStorageKey(fingerprint, toLang);
                            try {
                                stored = localStorage.getItem(storageKey);
                                if (stored) {
                                    data = JSON.parse(stored);
                                    pool_1 = this.pools.get(poolKey);
                                    if (!pool_1) {
                                        pool_1 = new Map();
                                        this.pools.set(poolKey, pool_1);
                                    }
                                    data.forEach(function (_a) {
                                        var text = _a.text, translation = _a.translation;
                                        pool_1 === null || pool_1 === void 0 ? void 0 : pool_1.set(text, translation);
                                    });
                                    this.loadedCombinations.add(poolKey);
                                }
                            }
                            catch (e) {
                                console.warn('Failed to load translation cache from localStorage:', e);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Load translations for a specific fingerprint and language from IndexedDB
         */
        TranslationPool.prototype.loadLanguageFromIndexedDB = function (fingerprint, toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var poolKey, dbPoolKey, entries, pool_2, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.indexedDB)
                                return [2 /*return*/];
                            poolKey = this.getPoolKey(fingerprint, toLang);
                            dbPoolKey = "".concat(this.senseId, "_").concat(poolKey);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.indexedDB.getAllByPoolKey(dbPoolKey)];
                        case 2:
                            entries = _a.sent();
                            if (entries.length > 0) {
                                pool_2 = this.pools.get(poolKey);
                                if (!pool_2) {
                                    pool_2 = new Map();
                                    this.pools.set(poolKey, pool_2);
                                }
                                entries.forEach(function (entry) {
                                    pool_2 === null || pool_2 === void 0 ? void 0 : pool_2.set(entry.text, entry.translation);
                                });
                                this.loadedCombinations.add(poolKey);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            e_2 = _a.sent();
                            console.warn('Failed to load translation cache from IndexedDB:', e_2);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.getStorageKey = function (fingerprint, toLang) {
            return "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_").concat(fingerprint, ":").concat(toLang);
        };
        TranslationPool.prototype.saveToStorage = function (fingerprint, toLang) {
            // If IndexedDB is enabled, save to IndexedDB instead of localStorage
            if (this.useIndexedDB && this.indexedDB) {
                this.saveToIndexedDB(fingerprint, toLang);
                return;
            }
            if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
                return;
            }
            var poolKey = this.getPoolKey(fingerprint, toLang);
            var storageKey = this.getStorageKey(fingerprint, toLang);
            try {
                var pool = this.pools.get(poolKey);
                var data_1 = [];
                if (pool) {
                    pool.forEach(function (translation, text) {
                        data_1.push({ text: text, translation: translation });
                    });
                }
                localStorage.setItem(storageKey, JSON.stringify(data_1));
            }
            catch (e) {
                console.warn('Failed to save translation cache to localStorage:', e);
            }
        };
        /**
         * Save translations to IndexedDB
         */
        TranslationPool.prototype.saveToIndexedDB = function (fingerprint, toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var poolKey, dbPoolKey, pool, entries, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.indexedDB)
                                return [2 /*return*/];
                            poolKey = this.getPoolKey(fingerprint, toLang);
                            dbPoolKey = "".concat(this.senseId, "_").concat(poolKey);
                            pool = this.pools.get(poolKey);
                            if (!pool || pool.size === 0)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            // First delete existing entries for this pool
                            return [4 /*yield*/, this.indexedDB.deleteAllByPoolKey(dbPoolKey)];
                        case 2:
                            // First delete existing entries for this pool
                            _a.sent();
                            entries = Array.from(pool.entries()).map(function (_a) {
                                var text = _a[0], translation = _a[1];
                                return ({
                                    id: "".concat(dbPoolKey, ":").concat(text),
                                    poolKey: dbPoolKey,
                                    text: text,
                                    translation: translation,
                                    dstLang: toLang,
                                    timestamp: Date.now(),
                                    // Default expiration: 32 hours (matching backend Redis cache)
                                    expiresAt: Date.now() + 32 * 60 * 60 * 1000,
                                });
                            });
                            return [4 /*yield*/, this.indexedDB.setMany(entries)];
                        case 3:
                            _a.sent();
                            console.log("[TranslationPool] Saved ".concat(entries.length, " translations to IndexedDB for ").concat(poolKey));
                            return [3 /*break*/, 5];
                        case 4:
                            e_3 = _a.sent();
                            console.warn('Failed to save translation cache to IndexedDB:', e_3);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.broadcastUpdate = function (text, translation) {
            if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
                return;
            }
            var fp = this.currentFingerprint || 'common';
            var toLang = this.currentToLang || 'en';
            var data = __assign({ result: this.getAllForFingerprint(fp, toLang) }, (text && translation && { text: text, translation: translation }));
            var message = {
                type: 'cache_update',
                senseId: this.senseId,
                fingerprint: this.currentFingerprint || undefined,
                data: data,
            };
            this.broadcastChannel.postMessage(message);
            this.saveToStorage(fp, toLang);
        };
        TranslationPool.prototype.handleCacheUpdate = function (message) {
            var _a, _b, _c;
            var fp = message.fingerprint || 'common';
            var toLang = this.currentToLang || 'en';
            var poolKey = this.getPoolKey(fp, toLang);
            if ((_a = message.data) === null || _a === void 0 ? void 0 : _a.result) {
                var pool_3 = this.pools.get(poolKey);
                if (!pool_3) {
                    pool_3 = new Map();
                    this.pools.set(poolKey, pool_3);
                }
                pool_3.clear();
                message.data.result.forEach(function (_a) {
                    var text = _a.text, translation = _a.translation;
                    // Skip empty keys or error placeholder keys
                    if (!text || text === 'error') {
                        return;
                    }
                    pool_3.set(text, translation);
                });
                this.loadedCombinations.add(poolKey);
            }
            if (((_b = message.data) === null || _b === void 0 ? void 0 : _b.text) && ((_c = message.data) === null || _c === void 0 ? void 0 : _c.translation)) {
                // Skip empty keys or error placeholder keys
                if (!message.data.text || message.data.text === 'error') {
                    return;
                }
                var pool = this.pools.get(poolKey) || new Map();
                pool.set(message.data.text, message.data.translation);
                this.pools.set(poolKey, pool);
                this.saveToStorage(fp, toLang);
            }
        };
        TranslationPool.prototype.handleCacheClear = function (message) {
            var fp = message.fingerprint || 'common';
            {
                this.clearFingerprint(fp);
            }
        };
        TranslationPool.prototype.handleInitialSyncRequest = function () {
            this.broadcastUpdate();
        };
        TranslationPool.prototype.queueTranslationRequest = function (request) {
            var _this = this;
            var key = "".concat(request.text, "-").concat(request.fingerprint || 'common');
            var existingPending = this.pendingResolutions[key];
            if (existingPending) {
                return new Promise(function (resolve, reject) {
                    existingPending.resolveList.push(resolve);
                    existingPending.rejectList.push(reject);
                });
            }
            return new Promise(function (resolve, reject) {
                var queuedReq = __assign(__assign({}, request), { resolveFunction: resolve, rejectFunction: reject });
                _this.queuedRequests.push(queuedReq);
                _this.pendingResolutions[key] = {
                    resolve: resolve,
                    reject: reject,
                    resolveList: [resolve],
                    rejectList: [reject],
                };
            });
        };
        TranslationPool.prototype.processQueuedRequests = function () {
            return __awaiter(this, arguments, void 0, function (maxRetries, retryDelayMs) {
                var requestsToProcess, uncachedRequests, cachedCount, _i, requestsToProcess_1, req, lookup, response, key, successCount, failCount, requestsByLang, _a, uncachedRequests_1, req, lang, _loop_2, this_2, _b, requestsByLang_1, _c, toLang, langRequests;
                var _d;
                var _e, e_4, _f, _g;
                if (maxRetries === void 0) { maxRetries = 3; }
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            if (this.queuedRequests.length === 0) {
                                this.loading = false;
                                return [2 /*return*/];
                            }
                            console.log("[TranslationPool] Processing ".concat(this.queuedRequests.length, " queued translation requests..."));
                            this.loading = false;
                            requestsToProcess = __spreadArray([], this.queuedRequests, true);
                            this.queuedRequests = [];
                            uncachedRequests = [];
                            cachedCount = 0;
                            for (_i = 0, requestsToProcess_1 = requestsToProcess; _i < requestsToProcess_1.length; _i++) {
                                req = requestsToProcess_1[_i];
                                lookup = this.lookup(req.text, req.fingerprint, req.toLang);
                                if (lookup.found && lookup.translation) {
                                    // Already in cache, resolve immediately
                                    cachedCount++;
                                    this.addTranslation(req.text, lookup.translation);
                                    response = TranslateStreamResponse.fromJson({
                                        originalText: req.text,
                                        translation: (_d = {}, _d[req.text] = lookup.translation, _d),
                                        timestamp: Date.now(),
                                        finished: true,
                                        batchIndex: 0,
                                    });
                                    req.resolveFunction(response);
                                    key = "".concat(req.text, "-").concat(req.fingerprint || 'common');
                                    delete this.pendingResolutions[key];
                                    if (this.onTranslationUpdated) {
                                        this.onTranslationUpdated(req.text, lookup.translation);
                                    }
                                }
                                else {
                                    uncachedRequests.push(req);
                                }
                            }
                            if (uncachedRequests.length === 0) {
                                this.broadcastUpdate();
                                console.log("[TranslationPool] All ".concat(cachedCount, " requests found in cache"));
                                if (this.onQueueProcessed) {
                                    this.onQueueProcessed(requestsToProcess.length);
                                }
                                return [2 /*return*/];
                            }
                            console.log("[TranslationPool] ".concat(cachedCount, " cached, ").concat(uncachedRequests.length, " uncached requesting from server in a single batch"));
                            successCount = cachedCount;
                            failCount = 0;
                            requestsByLang = new Map();
                            for (_a = 0, uncachedRequests_1 = uncachedRequests; _a < uncachedRequests_1.length; _a++) {
                                req = uncachedRequests_1[_a];
                                lang = req.toLang || 'en';
                                if (!requestsByLang.has(lang)) {
                                    requestsByLang.set(lang, []);
                                }
                                requestsByLang.get(lang).push(req);
                            }
                            _loop_2 = function (toLang, langRequests) {
                                var commonFingerprint, versionAtStart, stream, _loop_3, _j, stream_1, stream_1_1, state_1, e_4_1, _k, langRequests_1, pendingReq, key, error, error_1, _l, langRequests_2, pendingReq, key, error_2;
                                return __generator(this, function (_m) {
                                    switch (_m.label) {
                                        case 0:
                                            commonFingerprint = langRequests[0].fingerprint || this_2.currentFingerprint || 'common';
                                            versionAtStart = this_2.currentLanguageVersion;
                                            _m.label = 1;
                                        case 1:
                                            _m.trys.push([1, 14, , 15]);
                                            stream = this_2.client.translateBatchUncached(langRequests.map(function (r) { return ({ text: r.text, fromLang: r.fromLang }); }), toLang, commonFingerprint);
                                            _m.label = 2;
                                        case 2:
                                            _m.trys.push([2, 7, 8, 13]);
                                            _loop_3 = function () {
                                                _g = stream_1_1.value;
                                                _j = false;
                                                var response = _g;
                                                // If language version has changed, this response is from an old request
                                                // Do NOT process it - the language has already switched, old requests were cancelled
                                                // This prevents cache corruption and mixing data between different languages
                                                if (this_2.currentLanguageVersion !== versionAtStart) {
                                                    console.log("[TranslationPool] Language version changed from ".concat(versionAtStart, " to ").concat(this_2.currentLanguageVersion, " during batch processing - stopping old batch"));
                                                    return "break";
                                                }
                                                // Process each translation as it arrives
                                                // Use dstLang from response if available (back-end may auto-correct the target language)
                                                var responseDstLang = response.dstLang;
                                                var targetLang = responseDstLang || toLang;
                                                if (response.translation) {
                                                    var _loop_4 = function (text, translation) {
                                                        var _r;
                                                        // Find the original pending request - if response has dstLang, match using response language
                                                        var pendingReq = void 0;
                                                        if (responseDstLang) {
                                                            // If response has its own language, find the exact match
                                                            pendingReq = langRequests.find(function (r) { return r.text === text && r.toLang === responseDstLang; });
                                                        }
                                                        else {
                                                            // Fallback to matching with original request language
                                                            pendingReq = langRequests.find(function (r) { return r.text === text && r.toLang === toLang; });
                                                        }
                                                        // Even if we don't have a pending request (shouldn't happen), still add to cache with correct language
                                                        // This ensures we always use the language from the response (back-end might auto-correct)
                                                        this_2.addTranslation(text, translation, targetLang);
                                                        if (pendingReq) {
                                                            // Resolve the pending promise
                                                            var fullResponse = TranslateStreamResponse.fromJson({
                                                                originalText: text,
                                                                translation: (_r = {}, _r[text] = translation, _r),
                                                                timestamp: Date.now(),
                                                                finished: response.finished && Object.keys(response.translation).length === 0,
                                                                batchIndex: response.batchIndex || 0,
                                                                srcLang: response.srcLang,
                                                                dstLang: response.dstLang,
                                                            });
                                                            pendingReq.resolveFunction(fullResponse);
                                                            var key = "".concat(text, "-").concat(pendingReq.fingerprint || 'common');
                                                            delete this_2.pendingResolutions[key];
                                                            if (this_2.onTranslationUpdated) {
                                                                this_2.onTranslationUpdated(text, translation);
                                                            }
                                                            successCount++;
                                                        }
                                                    };
                                                    for (var _o = 0, _p = Object.entries(response.translation); _o < _p.length; _o++) {
                                                        var _q = _p[_o], text = _q[0], translation = _q[1];
                                                        _loop_4(text, translation);
                                                    }
                                                }
                                                if (response.finished) {
                                                    return "break";
                                                }
                                            };
                                            _j = true, stream_1 = (e_4 = void 0, __asyncValues(stream));
                                            _m.label = 3;
                                        case 3: return [4 /*yield*/, stream_1.next()];
                                        case 4:
                                            if (!(stream_1_1 = _m.sent(), _e = stream_1_1.done, !_e)) return [3 /*break*/, 6];
                                            state_1 = _loop_3();
                                            if (state_1 === "break")
                                                return [3 /*break*/, 6];
                                            _m.label = 5;
                                        case 5:
                                            _j = true;
                                            return [3 /*break*/, 3];
                                        case 6: return [3 /*break*/, 13];
                                        case 7:
                                            e_4_1 = _m.sent();
                                            e_4 = { error: e_4_1 };
                                            return [3 /*break*/, 13];
                                        case 8:
                                            _m.trys.push([8, , 11, 12]);
                                            if (!(!_j && !_e && (_f = stream_1.return))) return [3 /*break*/, 10];
                                            return [4 /*yield*/, _f.call(stream_1)];
                                        case 9:
                                            _m.sent();
                                            _m.label = 10;
                                        case 10: return [3 /*break*/, 12];
                                        case 11:
                                            if (e_4) throw e_4.error;
                                            return [7 /*endfinally*/];
                                        case 12: return [7 /*endfinally*/];
                                        case 13:
                                            // Check for any pending requests in this language group that didn't get a response - they failed
                                            for (_k = 0, langRequests_1 = langRequests; _k < langRequests_1.length; _k++) {
                                                pendingReq = langRequests_1[_k];
                                                key = "".concat(pendingReq.text, "-").concat(pendingReq.fingerprint || 'common');
                                                if (this_2.pendingResolutions[key]) {
                                                    // Still pending, means no response from server - fail it
                                                    if (pendingReq.rejectFunction) {
                                                        error = new Error("No translation response received for: \"".concat(pendingReq.text, "\" (").concat(toLang, ")"));
                                                        pendingReq.rejectFunction(error);
                                                    }
                                                    delete this_2.pendingResolutions[key];
                                                    failCount++;
                                                }
                                            }
                                            return [3 /*break*/, 15];
                                        case 14:
                                            error_1 = _m.sent();
                                            console.error("[TranslationPool] Batch request failed for language ".concat(toLang, ":"), error_1.message);
                                            // If batch fails, fail all remaining requests in this language group
                                            for (_l = 0, langRequests_2 = langRequests; _l < langRequests_2.length; _l++) {
                                                pendingReq = langRequests_2[_l];
                                                key = "".concat(pendingReq.text, "-").concat(pendingReq.fingerprint || 'common');
                                                if (this_2.pendingResolutions[key] && pendingReq.rejectFunction) {
                                                    error_2 = new Error("Batch translation failed for: \"".concat(pendingReq.text, "\" (").concat(toLang, ")"));
                                                    pendingReq.rejectFunction(error_2);
                                                    delete this_2.pendingResolutions[key];
                                                    failCount++;
                                                }
                                            }
                                            return [3 /*break*/, 15];
                                        case 15: return [2 /*return*/];
                                    }
                                });
                            };
                            this_2 = this;
                            _b = 0, requestsByLang_1 = requestsByLang;
                            _h.label = 1;
                        case 1:
                            if (!(_b < requestsByLang_1.length)) return [3 /*break*/, 4];
                            _c = requestsByLang_1[_b], toLang = _c[0], langRequests = _c[1];
                            return [5 /*yield**/, _loop_2(toLang, langRequests)];
                        case 2:
                            _h.sent();
                            _h.label = 3;
                        case 3:
                            _b++;
                            return [3 /*break*/, 1];
                        case 4:
                            this.broadcastUpdate();
                            console.log("[TranslationPool] Completed processing ".concat(requestsToProcess.length, " queued requests: ").concat(successCount, " success, ").concat(failCount, " failed (batch processing)"));
                            if (this.onQueueProcessed) {
                                this.onQueueProcessed(requestsToProcess.length);
                            }
                            if (failCount > 0) {
                                console.warn("[TranslationPool] ".concat(failCount, " requests failed after ").concat(maxRetries, " retries"));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.hasQueuedRequests = function () {
            return this.queuedRequests.length > 0;
        };
        TranslationPool.prototype.clearQueuedRequests = function () {
            console.log("Clearing ".concat(this.queuedRequests.length, " queued requests"));
            this.queuedRequests = [];
            this.pendingResolutions = {};
        };
        TranslationPool.prototype.isLoading = function () {
            return this.loading;
        };
        TranslationPool.prototype.isLanguageLoaded = function (fingerprint, toLang) {
            if (toLang === undefined) {
                var checkedToLang = fingerprint;
                for (var _i = 0, _a = this.loadedCombinations; _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (key.endsWith(":".concat(checkedToLang))) {
                        return true;
                    }
                }
                return false;
            }
            var poolKey = this.getPoolKey(fingerprint, toLang);
            return this.loadedCombinations.has(poolKey);
        };
        TranslationPool.prototype.initialize = function (toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var commonPoolKey, commonPool, hasLocalCache, fpPoolKey, fpPool, fpPoolKey, newLangTotal, fpPoolKey, fpPool, maxOtherLangSize, _i, _a, _b, poolKey, pool, shouldForceServerSync, allExistingTexts, existingInNewLang, _c, _d, _e, poolKey, pool, _f, _g, text, _h, _j, text, missingTexts, _k, allExistingTexts_1, text, error_3;
                var _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            if (this.loading) {
                                console.log("[TranslationPool] Already loading, skipping duplicate initialize");
                                return [2 /*return*/];
                            }
                            // Clear any pending requests from previous language to avoid backend pressure
                            this.clearQueuedRequests();
                            this.loading = true;
                            this.currentToLang = toLang;
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 10, 11, 12]);
                            console.log("[TranslationPool] Starting pool initialization... (toLang: ".concat(toLang, ")"));
                            // First try to load from persistent storage (localStorage / IndexedDB) for new language
                            // This ensures we have the cached translations for the new language before processing requests
                            return [4 /*yield*/, this.loadLanguageFromStorage('common', toLang)];
                        case 2:
                            // First try to load from persistent storage (localStorage / IndexedDB) for new language
                            // This ensures we have the cached translations for the new language before processing requests
                            _m.sent();
                            commonPoolKey = this.getPoolKey('common', toLang);
                            commonPool = this.pools.get(commonPoolKey);
                            hasLocalCache = commonPool && commonPool.size > 0;
                            if (!this.currentFingerprint) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.loadLanguageFromStorage(this.currentFingerprint, toLang)];
                        case 3:
                            _m.sent();
                            fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                            fpPool = this.pools.get(fpPoolKey);
                            if (fpPool && fpPool.size > 0) {
                                hasLocalCache = true;
                            }
                            _m.label = 4;
                        case 4:
                            // Mark combinations as loaded
                            this.loadedCombinations.add(commonPoolKey);
                            if (this.currentFingerprint) {
                                fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                                this.loadedCombinations.add(fpPoolKey);
                            }
                            newLangTotal = (commonPool === null || commonPool === void 0 ? void 0 : commonPool.size) || 0;
                            if (this.currentFingerprint) {
                                fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                                fpPool = this.pools.get(fpPoolKey);
                                if (fpPool) {
                                    newLangTotal += fpPool.size;
                                }
                            }
                            maxOtherLangSize = 0;
                            for (_i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
                                _b = _a[_i], poolKey = _b[0], pool = _b[1];
                                if (!poolKey.endsWith(":".concat(toLang))) {
                                    if (pool.size > maxOtherLangSize) {
                                        maxOtherLangSize = pool.size;
                                    }
                                }
                            }
                            shouldForceServerSync = hasLocalCache && maxOtherLangSize > 0 && newLangTotal < maxOtherLangSize * 0.5;
                            if (!(hasLocalCache && !shouldForceServerSync)) return [3 /*break*/, 5];
                            console.log("[TranslationPool] Using existing translations from local cache (no server fetch needed), loaded ".concat((commonPool === null || commonPool === void 0 ? void 0 : commonPool.size) || 0, " common + ").concat(this.currentFingerprint && ((_l = this.pools.get(this.getPoolKey(this.currentFingerprint, toLang))) === null || _l === void 0 ? void 0 : _l.size) || 0, " fingerprint entries"));
                            return [3 /*break*/, 8];
                        case 5:
                            if (shouldForceServerSync) {
                                console.log("[TranslationPool] Local cache has only ".concat(newLangTotal, " entries but largest other language has ").concat(maxOtherLangSize, " - forcing server sync to get auto-translated results"));
                            }
                            else {
                                console.log("Loading all translations from server for ".concat(toLang, " for cache synchronization (no local cache found)"));
                            }
                            // No local cache available, need to load from server
                            return [4 /*yield*/, this.loadFingerprintTranslations('common', undefined, toLang)];
                        case 6:
                            // No local cache available, need to load from server
                            _m.sent();
                            console.log("[TranslationPool] Common translations loaded for ".concat(toLang));
                            if (!this.currentFingerprint) return [3 /*break*/, 8];
                            return [4 /*yield*/, this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang)];
                        case 7:
                            _m.sent();
                            console.log("[TranslationPool] ".concat(this.currentFingerprint, " translations loaded for ").concat(toLang));
                            _m.label = 8;
                        case 8:
                            this.broadcastUpdate();
                            console.log("[TranslationPool] Pool initialization completed for ".concat(toLang, " (local cache: ").concat(hasLocalCache ? 'used' : 'not found, fetched from server', ")"));
                            if (this.onPoolInitialized) {
                                this.onPoolInitialized();
                            }
                            return [4 /*yield*/, this.processQueuedRequests()];
                        case 9:
                            _m.sent();
                            // Perform compensation translation: collect all existing texts from previous languages
                            // and check which ones are missing in the new language pool. If we have a registered
                            // callback, send the missing texts for translation to ensure all text gets translated.
                            if (this.onCompensationTranslate && this.pools.size > 0) {
                                allExistingTexts = new Set();
                                existingInNewLang = new Set();
                                // Iterate all pools to collect texts
                                for (_c = 0, _d = this.pools.entries(); _c < _d.length; _c++) {
                                    _e = _d[_c], poolKey = _e[0], pool = _e[1];
                                    if (poolKey.endsWith(":".concat(toLang))) {
                                        // This pool is for the new language - add all texts to existingInNewLang
                                        for (_f = 0, _g = pool.keys(); _f < _g.length; _f++) {
                                            text = _g[_f];
                                            existingInNewLang.add(text);
                                        }
                                    }
                                    else {
                                        // This pool is for an older language - add texts to allExistingTexts
                                        for (_h = 0, _j = pool.keys(); _h < _j.length; _h++) {
                                            text = _j[_h];
                                            allExistingTexts.add(text);
                                        }
                                    }
                                }
                                missingTexts = [];
                                for (_k = 0, allExistingTexts_1 = allExistingTexts; _k < allExistingTexts_1.length; _k++) {
                                    text = allExistingTexts_1[_k];
                                    if (!existingInNewLang.has(text)) {
                                        missingTexts.push(text);
                                    }
                                }
                                if (missingTexts.length > 0) {
                                    console.log("[TranslationPool] Found ".concat(missingTexts.length, " texts missing in new language ").concat(toLang, ", triggering compensation translation"));
                                    this.onCompensationTranslate(missingTexts, toLang);
                                }
                                else {
                                    console.log("[TranslationPool] No missing texts found in new language ".concat(toLang, ", no compensation needed"));
                                }
                            }
                            return [3 /*break*/, 12];
                        case 10:
                            error_3 = _m.sent();
                            console.error("[TranslationPool] Pool initialization failed for ".concat(toLang, ":"), error_3);
                            throw error_3;
                        case 11:
                            this.loading = false;
                            return [7 /*endfinally*/];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.loadFingerprintTranslations = function (fp, fingerprint, toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var poolKey, pool, updatedCount, addedCount, jsonRequest, req, stream, batchCount, _a, stream_2, stream_2_1, response, e_5_1, error_4;
                var _this = this;
                var _b, e_5, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            console.log("[TranslationPool] Loading translations for fingerprint=".concat(fp, ", toLang=").concat(toLang, "..."));
                            poolKey = this.getPoolKey(fp, toLang);
                            this.loadLanguageFromStorage(fp, toLang);
                            pool = this.pools.get(poolKey);
                            if (!pool) {
                                pool = new Map();
                                this.pools.set(poolKey, pool);
                            }
                            updatedCount = 0;
                            addedCount = 0;
                            jsonRequest = {
                                dstLang: toLang,
                            };
                            if (this.senseId && this.senseId.length > 0) {
                                jsonRequest.senseId = this.senseId;
                            }
                            if (fingerprint) {
                                jsonRequest.fingerprint = fingerprint;
                            }
                            // Add srcLang filter if defaultFromLang is configured (camelCase for fromJson)
                            if (this.defaultFromLang) {
                                jsonRequest.srcLang = this.defaultFromLang;
                            }
                            req = TranslateStreamRequest.fromJson(jsonRequest);
                            console.log("[TranslationPool] Sending batch initialization request:", jsonRequest);
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 14, , 15]);
                            stream = this.client.client.translateStream(req);
                            batchCount = 0;
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 7, 8, 13]);
                            _a = true, stream_2 = __asyncValues(stream);
                            _e.label = 3;
                        case 3: return [4 /*yield*/, stream_2.next()];
                        case 4:
                            if (!(stream_2_1 = _e.sent(), _b = stream_2_1.done, !_b)) return [3 /*break*/, 6];
                            _d = stream_2_1.value;
                            _a = false;
                            response = _d;
                            batchCount++;
                            console.log("[TranslationPool] Received batch #".concat(batchCount, ", ").concat(Object.keys(response.translation || {}).length, " entries"));
                            if (!response.translation)
                                return [3 /*break*/, 5];
                            Object.entries(response.translation).forEach(function (_a) {
                                var _b, _c;
                                var text = _a[0], translate = _a[1];
                                // Skip empty keys or error placeholder keys
                                if (!text || text === 'error') {
                                    return;
                                }
                                var translateStr = translate;
                                var existing = pool === null || pool === void 0 ? void 0 : pool.get(text);
                                if (existing === undefined) {
                                    addedCount++;
                                }
                                else if (existing !== translateStr) {
                                    updatedCount++;
                                }
                                pool === null || pool === void 0 ? void 0 : pool.set(text, translateStr);
                                var key = "".concat(text, "-").concat(fp);
                                if (_this.pendingResolutions[key]) {
                                    var responseObj_1 = TranslateStreamResponse.fromJson({
                                        originalText: text,
                                        translation: (_b = {}, _b[text] = translateStr, _b),
                                        timestamp: Date.now(),
                                        finished: true,
                                        batchIndex: 0,
                                    });
                                    _this.pendingResolutions[key].resolveList.forEach(function (resolve) { return resolve(responseObj_1); });
                                    delete _this.pendingResolutions[key];
                                }
                                if (fp !== 'common') {
                                    var commonKey = "".concat(text, "-common");
                                    if (_this.pendingResolutions[commonKey]) {
                                        var responseObj_2 = TranslateStreamResponse.fromJson({
                                            originalText: text,
                                            translation: (_c = {}, _c[text] = translateStr, _c),
                                            timestamp: Date.now(),
                                            finished: true,
                                            batchIndex: 0,
                                        });
                                        _this.pendingResolutions[commonKey].resolveList.forEach(function (resolve) { return resolve(responseObj_2); });
                                        delete _this.pendingResolutions[commonKey];
                                    }
                                }
                                if (_this.onTranslationLoaded) {
                                    _this.onTranslationLoaded(text, translateStr);
                                }
                            });
                            _e.label = 5;
                        case 5:
                            _a = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_5_1 = _e.sent();
                            e_5 = { error: e_5_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _e.trys.push([8, , 11, 12]);
                            if (!(!_a && !_b && (_c = stream_2.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _c.call(stream_2)];
                        case 9:
                            _e.sent();
                            _e.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_5) throw e_5.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13:
                            this.saveToStorage(fp, toLang);
                            if (updatedCount > 0 || addedCount > 0) {
                                console.log("[TranslationPool] Loaded ".concat(fp, ":").concat(toLang, " - added ").concat(addedCount, ", updated ").concat(updatedCount, " from remote"));
                            }
                            else {
                                console.log("[TranslationPool] Finished loading ".concat(fp, ":").concat(toLang, " - no new entries added"));
                            }
                            this.loadedCombinations.add(poolKey);
                            return [3 /*break*/, 15];
                        case 14:
                            error_4 = _e.sent();
                            console.error("[TranslationPool] Failed to load ".concat(fp, ":").concat(toLang, " from server:"), error_4);
                            throw error_4;
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        TranslationPool.prototype.addPreloadedTranslations = function (preloaded) {
            var _this = this;
            Object.entries(preloaded).forEach(function (_a) {
                var fingerprint = _a[0], langMap = _a[1];
                Object.entries(langMap).forEach(function (_a) {
                    var toLang = _a[0], translations = _a[1];
                    var poolKey = _this.getPoolKey(fingerprint, toLang);
                    var pool = _this.pools.get(poolKey);
                    if (!pool) {
                        pool = new Map();
                        _this.pools.set(poolKey, pool);
                    }
                    Object.entries(translations).forEach(function (_a) {
                        var text = _a[0], translation = _a[1];
                        pool.set(text, translation);
                        if (_this.onTranslationLoaded) {
                            _this.onTranslationLoaded(text, translation);
                        }
                    });
                    _this.loadedCombinations.add(poolKey);
                    _this.saveToStorage(fingerprint, toLang);
                });
            });
            this.broadcastUpdate();
        };
        TranslationPool.prototype.addTranslation = function (text, translation, toLang) {
            var fp = this.currentFingerprint || 'common';
            var lang = toLang || this.currentToLang || 'en';
            var poolKey = this.getPoolKey(fp, lang);
            var pool = this.pools.get(poolKey);
            if (!pool) {
                pool = new Map();
                this.pools.set(poolKey, pool);
            }
            pool.set(text, translation);
            this.saveToStorage(fp, lang);
            this.broadcastUpdate(text, translation);
        };
        TranslationPool.prototype.addTranslationToFingerprint = function (text, translation, fingerprint, toLang) {
            var poolKey = this.getPoolKey(fingerprint, toLang);
            var pool = this.pools.get(poolKey);
            if (!pool) {
                pool = new Map();
                this.pools.set(poolKey, pool);
            }
            pool.set(text, translation);
            this.saveToStorage(fingerprint, toLang);
            this.broadcastUpdate(text, translation);
        };
        /**
         * Correct an existing translation and synchronize the correction to backend database
         * This updates both the local cache and persists the correction to the server
         * @param text Original source text
         * @param correctedTranslation The corrected translation
         * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
         * @param toLang Optional target language (uses current language if not provided)
         * @param fromLang Optional source language (uses sense default if not provided)
         * @returns Promise that resolves when correction is saved to server
         */
        TranslationPool.prototype.correctTranslation = function (text, correctedTranslation, fingerprint, toLang, fromLang) {
            return __awaiter(this, void 0, void 0, function () {
                var fp, lang, requestId, jsonRequest, req, stream, _a, stream_3, stream_3_1, response, e_6_1, error_5;
                var _b, e_6, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            fp = fingerprint || this.currentFingerprint || 'common';
                            lang = toLang || this.currentToLang;
                            if (!lang) {
                                console.error('[TranslationPool] Cannot correct translation: target language not set');
                                return [2 /*return*/, { success: false, error: 'Target language not set' }];
                            }
                            // First update local cache immediately so UI reflects the correction
                            this.addTranslationToFingerprint(text, correctedTranslation, fp, lang);
                            // Trigger callback for UI updates
                            if (this.onTranslationUpdated) {
                                this.onTranslationUpdated(text, correctedTranslation);
                            }
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 14, , 15]);
                            requestId = "correct-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                            jsonRequest = {
                                requestId: requestId,
                                text: text,
                                fromLang: fromLang || '',
                                toLang: lang,
                                fingerprint: fp,
                                isCorrection: true,
                                correctedTranslation: correctedTranslation,
                            };
                            if (this.senseId && this.senseId.length > 0) {
                                jsonRequest.senseId = this.senseId;
                            }
                            req = TranslateStreamRequest.fromJson(jsonRequest);
                            stream = this.client.client.translateStream(req);
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 7, 8, 13]);
                            _a = true, stream_3 = __asyncValues(stream);
                            _e.label = 3;
                        case 3: return [4 /*yield*/, stream_3.next()];
                        case 4:
                            if (!(stream_3_1 = _e.sent(), _b = stream_3_1.done, !_b)) return [3 /*break*/, 6];
                            _d = stream_3_1.value;
                            _a = false;
                            response = _d;
                            if (response.finished) {
                                console.log("[TranslationPool] Correction saved for \"".concat(text, "\" \u2192 \"").concat(correctedTranslation, "\""));
                                return [2 /*return*/, { success: true }];
                            }
                            _e.label = 5;
                        case 5:
                            _a = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_6_1 = _e.sent();
                            e_6 = { error: e_6_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _e.trys.push([8, , 11, 12]);
                            if (!(!_a && !_b && (_c = stream_3.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _c.call(stream_3)];
                        case 9:
                            _e.sent();
                            _e.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_6) throw e_6.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13: return [2 /*return*/, { success: true }];
                        case 14:
                            error_5 = _e.sent();
                            console.error("[TranslationPool] Failed to save correction for \"".concat(text, "\":"), error_5);
                            return [2 /*return*/, { success: false, error: error_5 instanceof Error ? error_5.message : String(error_5) }];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Alias for addTranslationToFingerprint - convenient manual caching
         * Parameter order: text, fingerprint, translation, toLang
         */
        TranslationPool.prototype.put = function (text, fingerprint, translation, toLang) {
            // Set current language if not set, so subsequent lookups work correctly
            if (!this.currentToLang) {
                this.currentToLang = toLang;
            }
            this.addTranslationToFingerprint(text, translation, fingerprint, toLang);
        };
        TranslationPool.prototype.lookup = function (text, fingerprint, toLang) {
            var _this = this;
            var fp = fingerprint || this.currentFingerprint || 'common';
            var lang = toLang || this.currentToLang || 'en';
            var poolKey = this.getPoolKey(fp, lang);
            var pool = this.pools.get(poolKey);
            // Check if found in specific pool
            if (pool && pool.has(text)) {
                var translation = pool.get(text);
                // Check metadata to see if this entry is stale - trigger background update
                var metadataKey = "".concat(text, "|").concat(lang);
                var metadata = this.entryMetadata.get(metadataKey);
                var now = Date.now();
                var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
                if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
                    // Stale cache entry - trigger asynchronous background check for updates
                    // This will fetch the latest translation (including any manual corrections) from backend
                    // If updated, cache will be updated automatically and UI will be notified
                    setTimeout(function () {
                        if (_this.updateCallback) {
                            _this.updateCallback(text, lang);
                            // Update timestamp immediately to avoid repeated triggers
                            _this.updateEntryMetadata(text, lang);
                        }
                    }, 0);
                }
                return { found: true, fromCache: true, translation: translation };
            }
            // Check common pool if not found in specific fingerprint
            if (fp !== 'common') {
                var commonPoolKey = this.getPoolKey('common', lang);
                var commonPool = this.pools.get(commonPoolKey);
                if (commonPool && commonPool.has(text)) {
                    var translation = commonPool.get(text);
                    // Same stale check for common pool entries
                    var metadataKey = "".concat(text, "|").concat(lang);
                    var metadata = this.entryMetadata.get(metadataKey);
                    var now = Date.now();
                    var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
                    if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
                        setTimeout(function () {
                            if (_this.updateCallback) {
                                _this.updateCallback(text, lang);
                                _this.updateEntryMetadata(text, lang);
                            }
                        }, 0);
                    }
                    return { found: true, fromCache: true, translation: translation };
                }
            }
            return { found: false, fromCache: false };
        };
        /**
         * Check if any translation exists for the current language
         * This can be used to determine if translation pool has any translations
         * @returns boolean true if pool has any translations for current language
         */
        TranslationPool.prototype.hasAnyTranslations = function () {
            var toLang = this.currentToLang;
            if (!toLang)
                return false;
            for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], poolKey = _b[0], pool = _b[1];
                if (poolKey.endsWith(":".concat(toLang)) && pool.size > 0) {
                    return true;
                }
            }
            return false;
        };
        /**
         * Get the number of cached translations for a specific fingerprint and language
         * If language is not specified, uses current language
         * If fingerprint is not specified, returns total size across all fingerprints for current language
         * @param fingerprint Fingerprint (optional, returns total if not specified)
         * @param toLang Target language (uses current if not specified)
         * @returns Number of cached translations
         */
        TranslationPool.prototype.getCacheSize = function (fingerprint, toLang) {
            var targetLang = toLang || this.currentToLang || 'en';
            // If fingerprint is specified, return size for that specific pool
            if (fingerprint) {
                var poolKey = this.getPoolKey(fingerprint, targetLang);
                var pool = this.pools.get(poolKey);
                return (pool === null || pool === void 0 ? void 0 : pool.size) || 0;
            }
            // If no fingerprint specified, return total size across all fingerprints for current language
            var totalSize = 0;
            for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], poolKey = _b[0], pool = _b[1];
                if (poolKey.endsWith(":".concat(targetLang))) {
                    totalSize += pool.size;
                }
            }
            return totalSize;
        };
        /**
         * Get all translations for a fingerprint+language combination
         * @param fingerprint Fingerprint ('common' or specific)
         * @param toLang Target language
         * @returns Array of {text, translation}
         */
        TranslationPool.prototype.getAllForFingerprint = function (fingerprint, toLang) {
            var poolKey = this.getPoolKey(fingerprint, toLang);
            var pool = this.pools.get(poolKey);
            var result = [];
            if (pool) {
                pool.forEach(function (translation, text) {
                    result.push({ text: text, translation: translation });
                });
            }
            return result;
        };
        /**
         * Get all cached translations for current language across all fingerprints
         * @returns Map of all cached translations with full keys
         */
        TranslationPool.prototype.getAllForCurrentLanguage = function () {
            var toLang = this.currentToLang;
            if (!toLang)
                return new Map();
            var result = new Map();
            for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], poolKey = _b[0], pool = _b[1];
                if (poolKey.endsWith(":".concat(toLang))) {
                    result.set(poolKey, new Map(pool));
                }
            }
            return result;
        };
        /**
         * Clear all translations for a specific fingerprint
         * @param fingerprint Fingerprint to clear
         */
        TranslationPool.prototype.clearFingerprint = function (fingerprint) {
            var toLang = this.currentToLang;
            if (!toLang) {
                // If no language set, just remove the pool keys from memory
                for (var _i = 0, _a = this.pools.keys(); _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (key.startsWith("".concat(fingerprint, ":"))) {
                        this.pools.delete(key);
                        this.loadedCombinations.delete(key);
                    }
                }
                return;
            }
            var poolKey = this.getPoolKey(fingerprint, toLang);
            this.pools.delete(poolKey);
            this.loadedCombinations.delete(poolKey);
            if (this.crossTabOptions.enabled) {
                var storageKey = this.getStorageKey(fingerprint, toLang);
                try {
                    localStorage.removeItem(storageKey);
                }
                catch (e) {
                    console.warn('Failed to remove from localStorage:', e);
                }
            }
            this.clearQueuedRequests();
        };
        /**
         * Clear all cached translations for all fingerprints and languages
         * Does not affect preloaded translations unless they were added after initialization
         */
        TranslationPool.prototype.clearAll = function () {
            this.pools.clear();
            this.loadedCombinations.clear();
            this.clearQueuedRequests();
            if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
                var prefix = "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_");
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(function (key) { return localStorage.removeItem(key); });
            }
            console.log('[TranslationPool] Cleared all cached translations');
        };
        /**
         * Alias for clearAll - clear entire cache
         */
        TranslationPool.prototype.clearCache = function () {
            this.clearAll();
        };
        /**
         * Alias for clearAll - clear entire cache
         * Simple clear method for API compatibility
         */
        TranslationPool.prototype.clear = function () {
            this.clearAll();
        };
        /**
         * Set the current active fingerprint
         * Automatically loads the new fingerprint's translations for the current language
         * @param fingerprint New fingerprint to set
         * @param toLang Target language (optional, uses currentToLang if not provided)
         */
        TranslationPool.prototype.setCurrentFingerprint = function (fingerprint, toLang) {
            return __awaiter(this, void 0, void 0, function () {
                var targetLang, oldFingerprint, poolKey, pool;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            targetLang = toLang || this.currentToLang;
                            oldFingerprint = this.currentFingerprint;
                            this.currentFingerprint = fingerprint;
                            this.currentLanguageVersion++;
                            console.log("[TranslationPool] Changed current fingerprint from ".concat(oldFingerprint, " to: ").concat(fingerprint));
                            if (!(targetLang && fingerprint && fingerprint !== oldFingerprint)) return [3 /*break*/, 3];
                            poolKey = this.getPoolKey(fingerprint, targetLang);
                            this.loadLanguageFromStorage(fingerprint, targetLang);
                            pool = this.pools.get(poolKey);
                            if (!(pool && pool.size > 0)) return [3 /*break*/, 1];
                            // We already have cached translations in localStorage, no need to load from server
                            this.loadedCombinations.add(poolKey);
                            console.log("[TranslationPool] Using cached translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ") from localStorage (").concat(pool.size, " entries)"));
                            return [3 /*break*/, 3];
                        case 1:
                            // No local cache available, need to load from server
                            console.log("[TranslationPool] No local cache found, loading translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ") from server"));
                            return [4 /*yield*/, this.loadFingerprintTranslations(fingerprint, fingerprint, targetLang)];
                        case 2:
                            _a.sent();
                            console.log("[TranslationPool] Loaded translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ")"));
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Set the current target language
         * Automatically initializes the translation pool for the new language with common and current fingerprint
         * Uses existing initialize() method that already handles both common and fingerprint loading
         * @param toLang New target language
         * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
         */
        TranslationPool.prototype.setCurrentLanguage = function (toLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function () {
                var newLang, oldLang, _i, _a, req, _b, _c, key, pending, _d, _e, reject;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            newLang = toLang;
                            oldLang = this.currentToLang;
                            // Update fingerprint if provided
                            if (fingerprint !== undefined && fingerprint !== this.currentFingerprint) {
                                this.currentFingerprint = fingerprint;
                            }
                            // Clear queued requests when switching language to prevent backend pressure
                            // from accumulated requests during multiple language switches
                            if (this.queuedRequests.length > 0) {
                                console.log("[TranslationPool] Clearing ".concat(this.queuedRequests.length, " queued requests when switching language from ").concat(oldLang, " to ").concat(newLang));
                                for (_i = 0, _a = this.queuedRequests; _i < _a.length; _i++) {
                                    req = _a[_i];
                                    if (req.rejectFunction) {
                                        req.rejectFunction(new Error("Language switched from ".concat(oldLang, " to ").concat(newLang, ", request cancelled")));
                                    }
                                }
                                this.queuedRequests = [];
                            }
                            // Clear pending resolutions for any requests that were waiting
                            for (_b = 0, _c = Object.keys(this.pendingResolutions); _b < _c.length; _b++) {
                                key = _c[_b];
                                pending = this.pendingResolutions[key];
                                if (pending.rejectList) {
                                    for (_d = 0, _e = pending.rejectList; _d < _e.length; _d++) {
                                        reject = _e[_d];
                                        reject(new Error("Language switched from ".concat(oldLang, " to ").concat(newLang, ", request cancelled")));
                                    }
                                }
                                delete this.pendingResolutions[key];
                            }
                            this.currentToLang = newLang;
                            this.currentLanguageVersion++;
                            console.log("[TranslationPool] Changed current target language from ".concat(oldLang, " to: ").concat(newLang));
                            // When switching language, stop the persistent stream because any old responses
                            // would be for the wrong language and cause cache corruption
                            if (this.client.isPersistentStreamConnected()) {
                                console.log('[TranslationPool] Language changed, stopping persistent stream to prevent cache corruption');
                                this.client.stopPersistentStream();
                            }
                            // Full initialize for the new language - this properly loads both common and current fingerprint
                            // The existing initialize method already has the correct logic
                            return [4 /*yield*/, this.initialize(newLang)];
                        case 1:
                            // Full initialize for the new language - this properly loads both common and current fingerprint
                            // The existing initialize method already has the correct logic
                            _f.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get current active fingerprint
         * @returns Current fingerprint or null
         */
        TranslationPool.prototype.getCurrentFingerprint = function () {
            return this.currentFingerprint;
        };
        /**
         * Get current target language
         * @returns Current target language or null
         */
        TranslationPool.prototype.getCurrentLanguage = function () {
            return this.currentToLang;
        };
        /**
         * Start background update checker that periodically checks for stale translations
         * Only runs if background update is enabled
         */
        TranslationPool.prototype.startBackgroundUpdateChecker = function () {
            var _this = this;
            if (!this.backgroundUpdateOptions.enabled || typeof window === 'undefined') {
                return;
            }
            if (this.backgroundUpdateTimer) {
                clearInterval(this.backgroundUpdateTimer);
            }
            this.backgroundUpdateTimer = setInterval(function () {
                _this.checkForStaleTranslations();
            }, this.backgroundUpdateOptions.intervalMs);
            console.log("[TranslationPool] Started background update checker every ".concat(this.backgroundUpdateOptions.intervalMs, "ms"));
        };
        /**
         * Stop background update checker
         */
        TranslationPool.prototype.stopBackgroundUpdateChecker = function () {
            if (this.backgroundUpdateTimer) {
                clearInterval(this.backgroundUpdateTimer);
                this.backgroundUpdateTimer = null;
                console.log('[TranslationPool] Stopped background update checker');
            }
        };
        /**
         * Check for stale translations and request updates
         * This is called automatically by the background timer
         */
        TranslationPool.prototype.checkForStaleTranslations = function () {
            var _this = this;
            if (!this.updateCallback || !this.currentToLang) {
                return;
            }
            var now = Date.now();
            var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
            var staleEntries = [];
            this.entryMetadata.forEach(function (metadata, key) {
                if (now - metadata.lastUpdated > staleThreshold) {
                    var _a = key.split('|'), text = _a[0], toLang = _a[1];
                    staleEntries.push({ text: text, toLang: toLang });
                }
            });
            if (staleEntries.length === 0) {
                return;
            }
            var batchSize = this.backgroundUpdateOptions.batchSize;
            var staleToProcess = staleEntries.slice(0, batchSize);
            staleToProcess.forEach(function (_a) {
                var text = _a.text, toLang = _a.toLang;
                if (_this.updateCallback) {
                    _this.updateCallback(text, toLang);
                }
            });
            console.log("[TranslationPool] Triggered update for ".concat(staleToProcess.length, " stale translations"));
        };
        /**
         * Update metadata for a cache entry when it's fetched from server
         * @param text Original text
         * @param toLang Target language
         */
        TranslationPool.prototype.updateEntryMetadata = function (text, toLang) {
            var key = "".concat(text, "|").concat(toLang);
            var existing = this.entryMetadata.get(key);
            this.entryMetadata.set(key, {
                lastUpdated: Date.now(),
                version: ((existing === null || existing === void 0 ? void 0 : existing.version) || 0) + 1,
            });
        };
        return TranslationPool;
    }());
    var TranslationClient = /** @class */ (function () {
        function TranslationClient(options) {
            var _this = this;
            this.persistentStream = null;
            this.persistentStreamWriter = null;
            this.persistentStreamReader = null;
            this.persistentStreamConnected = false;
            this.options = options;
            // If baseUrl is not provided, use the default production endpoint
            // The baseUrl should include the API path prefix for Connect RPC
            // New route structure: /api/v1/rpc/cr/<service>/<method>
            // Expected format: https://api.hottol.com/laker (behind API gateway, context path /laker)
            // All connect rpc requests start with /api/v1/rpc/cr/ for easier routing management
            var defaultBaseUrl = "https://api.hottol.com/laker";
            this.baseUrl = options.baseUrl
                ? options.baseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate"
                : defaultBaseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate";
            this.token = options.token;
            // Interceptor that guarantees no dots in final URL - remove any segment containing a dot
            // This is defense in depth, double guarantee
            var urlRewriteInterceptor = function (next) { return function (req) { return __awaiter(_this, void 0, void 0, function () {
                var url, parts, filtered;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = new URL(req.url);
                            parts = url.pathname.split('/').filter(function (p) { return p !== ''; });
                            filtered = parts.filter(function (segment) { return !segment.includes('.'); });
                            if (filtered.length !== parts.length) {
                                url.pathname = '/' + filtered.join('/');
                                // connect-core 的 HttpRequest.url 是 readonly；用 defineProperty 覆盖以保留重写行为
                                Object.defineProperty(req, 'url', { value: url.toString(), writable: true, configurable: true });
                                console.debug('[TranslationClient] Rewrote URL:', req.url);
                            }
                            return [4 /*yield*/, next(req)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }; };
            // Get original baseUrl, we need to ensure no segments contain dots
            // We actually want the baseUrl to stop before adding service/method
            // After filtering, the interceptor will do the final cleanup
            var urlObj = new URL(this.baseUrl);
            var pathParts = urlObj.pathname.split('/').filter(function (p) { return p !== ''; });
            // Remove ALL segments that contain dots - these are service names with dots from misconfiguration
            var filteredParts = pathParts.filter(function (segment) { return !segment.includes('.'); });
            urlObj.pathname = '/' + filteredParts.join('/');
            var baseUrl = urlObj.toString();
            // Update this.baseUrl to the filtered version for debugging
            this.baseUrl = baseUrl;
            // Combine interceptors - URL rewrite must come first, then auth
            var baseInterceptors = [urlRewriteInterceptor];
            if (this.token) {
                baseInterceptors.push(function (next) { return function (req) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                req.header.set('api-key-token', this.token);
                                return [4 /*yield*/, next(req)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); }; });
            }
            // When user provides a custom transport, we still need to add our base interceptors
            // This ensures that:
            // 1. URL rewrite is always applied (removing dots from segments)
            // 2. Authentication token is always added if provided
            // We combine our base interceptors with any existing interceptors from the user's transport creation
            // Note: For createConnectTransport generated transports, interceptors are stored on the transport object
            // so we can extract them and recreate with combined interceptors
            // User can also provide createConnectTransport in options for Node.js ESM use case
            var createConnectTransportFn = options.createConnectTransport || createConnectTransport;
            var combinedInterceptors = __spreadArray([], baseInterceptors, true);
            if (options.transport) {
                // @ts-ignore - types match at runtime, accessing original options from transport creation
                // createConnectTransport stores baseUrl and interceptors on the instance
                if (options.transport._interceptors) {
                    // @ts-ignore
                    combinedInterceptors = __spreadArray(__spreadArray([], baseInterceptors, true), options.transport._interceptors, true);
                }
                // When user provides transport created with createConnectTransport, we extract
                // the baseUrl and recreate with our combined interceptors. This guarantees
                // our base interceptors (URL rewrite and auth) are always applied
                // @ts-ignore
                var existingBaseUrl = options.transport._baseUrl || baseUrl;
                if (!createConnectTransportFn) {
                    // If createConnectTransport isn't available (pure ESM Node.js loading dynamic),
                    // we can't recreate - user must have already added our required interceptors themselves
                    this.transport = options.transport;
                    console.debug('[TranslationClient] Using user-provided transport as-is (createConnectTransport unavailable)');
                }
                else {
                    // Check cache for existing transport with identical configuration
                    var cacheKey = getTransportCacheKey({
                        baseUrl: existingBaseUrl,
                        interceptors: combinedInterceptors,
                        token: this.token
                    });
                    if (cachedTransports.has(cacheKey)) {
                        // Reuse existing transport - this maximizes HTTP connection reuse
                        this.transport = cachedTransports.get(cacheKey);
                        console.debug('[TranslationClient] Reusing cached transport for', existingBaseUrl);
                    }
                    else {
                        // Recreate the transport with our combined interceptors
                        // This guarantees our base interceptors are always applied
                        var newTransport = createConnectTransportFn({
                            baseUrl: existingBaseUrl,
                            useHttpGet: false,
                            useBinary: false,
                            interceptors: combinedInterceptors,
                        });
                        // Store baseUrl and interceptors on our new transport for future reuse
                        // @ts-ignore
                        newTransport._baseUrl = existingBaseUrl;
                        // @ts-ignore
                        newTransport._interceptors = combinedInterceptors;
                        // @ts-ignore - transport interface matches
                        this.transport = newTransport;
                        // Cache for future reuse
                        cachedTransports.set(cacheKey, this.transport);
                        console.debug('[TranslationClient] Recreated user-provided transport with base interceptors added');
                    }
                }
            }
            else {
                // Create Connect transport with our base interceptors that guarantee URL rewrite and auth
                if (!createConnectTransport) {
                    throw new Error('createConnectTransport is not initialized. If you are using pure ESM in Node.js, ' +
                        'you need to manually create and provide the transport. ' +
                        'See documentation for details.');
                }
                // Check cache for existing transport with identical configuration
                var cacheKey = getTransportCacheKey({
                    baseUrl: baseUrl,
                    interceptors: combinedInterceptors,
                    token: this.token
                });
                if (cachedTransports.has(cacheKey)) {
                    // Reuse existing transport - this maximizes HTTP connection reuse
                    this.transport = cachedTransports.get(cacheKey);
                    console.debug('[TranslationClient] Reusing cached transport for', baseUrl);
                }
                else {
                    // Use JSON encoding because backend uses custom json codec (application/json)
                    // This matches the backend registration: encoding.RegisterCodec(jsonCodec{}) with Name() = "json"
                    var originalTransport = createConnectTransportFn({
                        baseUrl: baseUrl,
                        useHttpGet: false,
                        useBinary: false,
                        interceptors: combinedInterceptors,
                    });
                    // Store baseUrl and interceptors on the transport instance for potential reuse
                    // @ts-ignore
                    originalTransport._baseUrl = baseUrl;
                    // @ts-ignore
                    originalTransport._interceptors = combinedInterceptors;
                    // @ts-ignore - transport interface matches
                    this.transport = originalTransport;
                    // Cache for future reuse
                    cachedTransports.set(cacheKey, this.transport);
                    console.debug('[TranslationClient] Created new transport and cached for reuse');
                }
            }
            this.client = createClient(TranslationService, this.transport);
            this.senseId = options.senseId;
            this.defaultFromLang = options.defaultFromLang || 'en';
            // Create and manage translation pool internally
            this.pool = new TranslationPool(this, this.senseId, {
                crossTab: options.crossTab,
                backgroundUpdate: options.backgroundUpdate,
                persistentStorage: options.persistentStorage,
                defaultFromLang: this.defaultFromLang,
            });
        }
        /**
         * Simple one-shot translation - automatically handles caching, initialization, and queuing
         * Auto-detects fingerprint and language changes, automatically loads new translation pool
         * @param text Original text to translate
         * @param toLang Target language code
         * @param fromLang Source language code (optional, defaults to client default)
         * @param fingerprint Text fingerprint for domain-specific translations
         * @returns Promise with translated text (resolves when translation completes)
         */
        TranslationClient.prototype.translate = function (text, toLang, fromLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function () {
                var actualFromLang, actualFingerprint, currentLang, currentFingerprint, lookup, response;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            actualFromLang = fromLang || this.defaultFromLang;
                            actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
                            currentLang = this.pool.getCurrentLanguage();
                            if (!(currentLang === null || currentLang !== toLang)) return [3 /*break*/, 2];
                            // Language changed (or first load after page refresh), auto-load the new language for the current fingerprint
                            console.log("[TranslationClient] Language changed from ".concat(currentLang, " to ").concat(toLang, ", auto-loading translation pool"));
                            return [4 /*yield*/, this.pool.setCurrentLanguage(toLang, actualFingerprint)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            currentFingerprint = this.pool.getCurrentFingerprint();
                            if (!(fingerprint !== undefined && fingerprint !== currentFingerprint)) return [3 /*break*/, 4];
                            // Fingerprint changed, update current and auto-load for current language
                            console.log("[TranslationClient] Fingerprint changed from ".concat(currentFingerprint, " to ").concat(fingerprint, ", auto-loading translations"));
                            return [4 /*yield*/, this.pool.setCurrentFingerprint(fingerprint, toLang)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            lookup = this.pool.lookup(text, actualFingerprint, toLang);
                            if (lookup.found && lookup.translation) {
                                return [2 /*return*/, lookup.translation];
                            }
                            if (!!this.pool.isLanguageLoaded(actualFingerprint, toLang)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.pool.initialize(toLang)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            // Use persistent streaming connection for all real-time requests
                            // This avoids creating a new HTTP connection for every single word
                            if (this.persistentStreamConnected && this.persistentStreamWriter) {
                                return [2 /*return*/, new Promise(function (resolve, reject) {
                                        var requestId = "".concat(text, "-").concat(Date.now(), "-").concat(Math.random());
                                        var req = TranslateStreamRequest.fromJson({
                                            text: text,
                                            senseId: _this.senseId,
                                            toLang: toLang,
                                            fromLang: actualFromLang,
                                            fingerprint: actualFingerprint,
                                            requestId: requestId,
                                            persistent: true,
                                        });
                                        // Store the pending resolver in the pool
                                        _this.pool.addPendingResolver(requestId, function (response) {
                                            resolve(response.translation[text] || text);
                                        }, reject);
                                        // Send the request through the persistent stream
                                        _this.persistentStreamWriter(req).catch(function (err) {
                                            console.error('[TranslationClient] Failed to send request on persistent stream:', err);
                                            reject(err);
                                        });
                                    })];
                            }
                            return [4 /*yield*/, this.pool.queueTranslationRequest({
                                    text: text,
                                    toLang: toLang,
                                    fromLang: actualFromLang,
                                    fingerprint: actualFingerprint,
                                })];
                        case 7:
                            response = _b.sent();
                            return [2 /*return*/, response.translation[text] || text];
                    }
                });
            });
        };
        /**
        * Translate text with full response details (direct API call, no caching)
        * Auto-detects fingerprint if not provided
        * @param text Original text to translate
        * @param toLang Target language code
        * @param fromLang Source language code (optional, defaults to client default)
        * @param fingerprint Text fingerprint for domain-specific translations
        * @returns Promise with complete translation response
        */
        TranslationClient.prototype.translateWithDetails = function (text_1, toLang_1, fromLang_1, fingerprint_1) {
            return __awaiter(this, arguments, void 0, function (text, toLang, fromLang, fingerprint, timeoutMs) {
                var actualFromLang, actualFingerprint, req, lastResponse, received, stream_4, timeoutPromise, streamPromise, error_6;
                var _this = this;
                var _a;
                if (timeoutMs === void 0) { timeoutMs = 30000; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            actualFromLang = fromLang || this.defaultFromLang;
                            actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
                            req = TranslateStreamRequest.fromJson({
                                text: text,
                                toLang: toLang,
                                fromLang: actualFromLang,
                                fingerprint: actualFingerprint,
                            });
                            console.log("[TranslationClient] Requesting translation for \"".concat(text, "\", fingerprint=").concat(actualFingerprint, ", toLang=").concat(toLang));
                            console.log("[TranslationClient] Request:", req);
                            lastResponse = null;
                            received = 0;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            stream_4 = this.client.translateStream(req);
                            timeoutPromise = new Promise(function (_, reject) {
                                setTimeout(function () {
                                    reject(new Error("Translation timeout after ".concat(timeoutMs, "ms for \"").concat(text, "\"")));
                                }, timeoutMs);
                            });
                            streamPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a, stream_5, stream_5_1, response, e_7_1;
                                var _b, e_7, _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _e.trys.push([0, 5, 6, 11]);
                                            _a = true, stream_5 = __asyncValues(stream_4);
                                            _e.label = 1;
                                        case 1: return [4 /*yield*/, stream_5.next()];
                                        case 2:
                                            if (!(stream_5_1 = _e.sent(), _b = stream_5_1.done, !_b)) return [3 /*break*/, 4];
                                            _d = stream_5_1.value;
                                            _a = false;
                                            response = _d;
                                            received++;
                                            console.log("[TranslationClient] Received chunk ".concat(received, ":"), response);
                                            lastResponse = response;
                                            // If response is marked as finished, we can stop early
                                            if (response.finished) {
                                                return [3 /*break*/, 4];
                                            }
                                            _e.label = 3;
                                        case 3:
                                            _a = true;
                                            return [3 /*break*/, 1];
                                        case 4: return [3 /*break*/, 11];
                                        case 5:
                                            e_7_1 = _e.sent();
                                            e_7 = { error: e_7_1 };
                                            return [3 /*break*/, 11];
                                        case 6:
                                            _e.trys.push([6, , 9, 10]);
                                            if (!(!_a && !_b && (_c = stream_5.return))) return [3 /*break*/, 8];
                                            return [4 /*yield*/, _c.call(stream_5)];
                                        case 7:
                                            _e.sent();
                                            _e.label = 8;
                                        case 8: return [3 /*break*/, 10];
                                        case 9:
                                            if (e_7) throw e_7.error;
                                            return [7 /*endfinally*/];
                                        case 10: return [7 /*endfinally*/];
                                        case 11: return [2 /*return*/, lastResponse];
                                    }
                                });
                            }); })();
                            return [4 /*yield*/, Promise.race([streamPromise, timeoutPromise])];
                        case 2:
                            lastResponse = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_6 = _b.sent();
                            console.error("[TranslationClient] Translation failed for \"".concat(text, "\":"), error_6);
                            throw error_6;
                        case 4:
                            if (lastResponse) {
                                console.log("[TranslationClient] Translation complete, final response:", lastResponse);
                                return [2 /*return*/, lastResponse];
                            }
                            // If no response, throw an error
                            console.error("[TranslationClient] No translation response received for \"".concat(text, "\""));
                            throw new Error('No translation response received');
                    }
                });
            });
        };
        /**
         * Translate multiple uncached texts in a single batch streaming request
         * All requests are sent over ONE HTTP connection, only shows one request in browser network panel
         * Greatly reduces the number of visible requests during page initialization
         * @param texts Array of text objects to translate ({text, fromLang})
         * @param toLang Target language for all translations
         * @param fingerprint Optional fingerprint
         * @returns Async iterable stream of translation responses as they arrive
         */
        TranslationClient.prototype.translateBatchUncached = function (texts, toLang, fingerprint) {
            // All requests go in the same single HTTP/2 streaming connection
            // This creates only ONE request entry in browser developer tools network panel
            var req = TranslateStreamRequest.fromJson({
                senseId: this.senseId,
                dstLang: toLang,
                fingerprint: fingerprint,
                persistent: false,
                texts: texts.map(function (t) { return ({
                    text: t.text,
                    fromLang: t.fromLang,
                }); }),
            });
            var stream = this.client.translateStream(req);
            return stream;
        };
        /**
         * Stream translation batches for a semantic sense
         * Uses native Connect RPC streaming with true multiplexing
         * @param senseId Semantic sense ID
         * @param dstLang Target language
         * @param fingerprint Optional fingerprint for specific domain
         * @param batchSize Optional batch size (default 500)
         * @returns Async iterable stream of translation responses
         */
        TranslationClient.prototype.translateStream = function (senseId, dstLang, fingerprint) {
            var req = TranslateStreamRequest.fromJson({
                senseId: senseId,
                dstLang: dstLang,
            });
            if (fingerprint) {
                req.fingerprint = fingerprint;
            }
            return this.client.translateStream(req);
        };
        /**
         Get paged list of translations for a semantic sense with optional filtering
         * @param options Request options including filtering, pagination
         * @returns Promise with filtered, paged translations
         */
        TranslationClient.prototype.getSenseTranslations = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                var req;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req = GetSenseTranslateRequest.fromJson({
                                senseId: options.senseId,
                            });
                            if (options.fingerprint !== undefined) {
                                req.fingerprint = options.fingerprint;
                            }
                            if (options.page !== undefined) {
                                req.page = options.page;
                            }
                            if (options.pageSize !== undefined) {
                                req.pageSize = options.pageSize;
                            }
                            // Pass language filtering parameters - use camelCase field names as generated by Protobuf ES
                            if (options.srcLang !== undefined) {
                                req.fromLang = options.srcLang;
                            }
                            if (options.dstLang !== undefined) {
                                req.toLang = options.dstLang;
                            }
                            return [4 /*yield*/, this.client.getSenseTranslate(req)];
                        case 1: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /**
         * Alias for getSenseTranslations - compatibility alias
         * Get paged list of translations for a semantic sense with optional filtering
         * @param options Request options including filtering, pagination
         * @returns Promise with filtered, paged translations
         */
        TranslationClient.prototype.getSenseTranslate = function (options) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.getSenseTranslations(options)];
                });
            });
        };
        /**
         * Compatibility connect method - Connect RPC automatically manages connections
         * This is provided for API compatibility only
         */
        TranslationClient.prototype.connect = function () {
            // Connect RPC manages connection automatically - no action needed
            console.debug('[TranslationClient] connect() called - Connect RPC manages connections automatically');
        };
        /**
         * Create a translation pool for preloading and caching translations
         * @param senseId Semantic sense ID to create pool for
         * @param options Pool configuration options
         * @returns TranslationPool instance
         */
        TranslationClient.prototype.createPool = function (senseId, options) {
            return new TranslationPool(this, senseId, options);
        };
        /**
         * Get the underlying Connect RPC client for advanced use
         * @returns The client instance
         */
        TranslationClient.prototype.getClient = function () {
            return this.client;
        };
        /**
         * Start a persistent streaming connection for all real-time translation requests.
         * This reuses a single long-lived HTTP connection for all requests,
         * avoiding the overhead of creating a new connection for every word.
         * Only one persistent stream is maintained at a time.
         * @returns Promise that resolves when the stream is connected and ready
         */
        TranslationClient.prototype.startPersistentStream = function () {
            return __awaiter(this, void 0, void 0, function () {
                var req;
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.persistentStreamConnected) {
                        console.log('[TranslationClient] Persistent stream already connected');
                        return [2 /*return*/];
                    }
                    if (this.persistentStream) {
                        console.log('[TranslationClient] Persistent stream already started, reconnecting...');
                    }
                    console.log('[TranslationClient] Starting persistent streaming connection...');
                    req = TranslateStreamRequest.fromJson({
                        persistent: true, // Mark as persistent connection on server side
                    });
                    this.persistentStream = this.client.translateStream(req);
                    // We need a channel-like approach to allow sending requests while reading responses
                    // Connect RPC for browser uses HTTP/2 streaming which supports full duplex
                    // We have server streaming where client sends one initial request
                    // To get full duplex, we need to handle it as a stream that allows sending multiple requests
                    // For browsers with connect-web, it's server streaming - so we use request batching
                    // So the persistent stream will listen for responses while allowing new requests to be batched
                    // In our current protocol:
                    //  - We use POST with chunked encoding, every response comes back as they're processed
                    //  - Each request has request_id, matches the response comes back with same request_id
                    // Start the reader in the background that continuously processes responses
                    this.persistentStreamReader = function () { return __awaiter(_this, void 0, void 0, function () {
                        var versionAtStart, _loop_5, this_3, _a, _b, _c, state_2, e_8_1, error_7;
                        var _this = this;
                        var _d, e_8, _e, _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    _g.trys.push([0, 13, , 14]);
                                    versionAtStart = this.pool.currentLanguageVersion;
                                    _g.label = 1;
                                case 1:
                                    _g.trys.push([1, 6, 7, 12]);
                                    _loop_5 = function () {
                                        _f = _c.value;
                                        _a = false;
                                        var response = _f;
                                        // If language version has changed, this is an old stream from previous language
                                        // Stop reading immediately - all pending requests were already rejected
                                        // This prevents cache corruption where old responses get added to new language cache
                                        if (this_3.pool.currentLanguageVersion !== versionAtStart) {
                                            console.log("[TranslationClient] Language version changed from ".concat(versionAtStart, " to ").concat(this_3.pool.currentLanguageVersion, " during persistent streaming - stopping old stream"));
                                            this_3.stopPersistentStream();
                                            return "break";
                                        }
                                        // Check if this response matches a pending request by requestId
                                        var resp = response;
                                        if (resp.requestId) {
                                            var pending = this_3.pool.pendingResolutions[resp.requestId];
                                            if (pending) {
                                                // Resolve the pending request with the response
                                                pending.resolveList.forEach(function (resolve) { return resolve(response); });
                                                // Remove from pending after resolving
                                                delete this_3.pool.pendingResolutions[resp.requestId];
                                                // Add translation to the cache if it contains translations
                                                if (resp.translation && Object.keys(resp.translation).length > 0) {
                                                    Object.entries(resp.translation).forEach(function (_a) {
                                                        var _b, _c;
                                                        var text = _a[0], translation = _a[1];
                                                        var fp = (_b = _this.pool.getCurrentFingerprint()) !== null && _b !== void 0 ? _b : 'common';
                                                        var toLang = (_c = _this.pool.getCurrentLanguage()) !== null && _c !== void 0 ? _c : 'en';
                                                        _this.pool.addTranslationToFingerprint(text, translation, fp, toLang);
                                                    });
                                                }
                                            }
                                        }
                                        // If finished flag means this particular batch is done
                                        if (resp.finished && !resp.requestId) {
                                            // Whole connection is closed by server, we can reconnect
                                            console.log('[TranslationClient] Persistent stream finished by server, will reconnect on next request');
                                            this_3.stopPersistentStream();
                                            return "break";
                                        }
                                    };
                                    this_3 = this;
                                    _a = true, _b = __asyncValues(this.persistentStream);
                                    _g.label = 2;
                                case 2: return [4 /*yield*/, _b.next()];
                                case 3:
                                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                                    state_2 = _loop_5();
                                    if (state_2 === "break")
                                        return [3 /*break*/, 5];
                                    _g.label = 4;
                                case 4:
                                    _a = true;
                                    return [3 /*break*/, 2];
                                case 5: return [3 /*break*/, 12];
                                case 6:
                                    e_8_1 = _g.sent();
                                    e_8 = { error: e_8_1 };
                                    return [3 /*break*/, 12];
                                case 7:
                                    _g.trys.push([7, , 10, 11]);
                                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                                    return [4 /*yield*/, _e.call(_b)];
                                case 8:
                                    _g.sent();
                                    _g.label = 9;
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    if (e_8) throw e_8.error;
                                    return [7 /*endfinally*/];
                                case 11: return [7 /*endfinally*/];
                                case 12: return [3 /*break*/, 14];
                                case 13:
                                    error_7 = _g.sent();
                                    console.error('[TranslationClient] Persistent stream reader error:', error_7);
                                    // Reject all pending requests
                                    Object.values(this.pool.pendingResolutions).forEach(function (pending) {
                                        pending.rejectList.forEach(function (reject) { return reject(error_7); });
                                    });
                                    this.pool.pendingResolutions = {};
                                    this.stopPersistentStream();
                                    return [3 /*break*/, 14];
                                case 14: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Start reading in the background
                    this.persistentStreamConnected = true;
                    // We need to allow sending - for server streaming, we can't send after initial request
                    // So our protocol changes: All requests are sent with request_id and responses match request_id
                    // Since it's server streaming from the browser, we open the persistent connection,
                    // and the server sends back responses as requests are processed
                    // To send new requests after opening, we need to have multiple requests batched in initial connection
                    // So for persistent connection we just keep it open continuously
                    // Start reading responses
                    // In our current implementation with server streaming, we can do:
                    // The client sends a request with all current queued requests, server streams back responses
                    // When a new request comes in, it goes to queue and we wait for it to be processed on the next reconnect
                    // Actually - connect-web doesn't support client streaming from browser, only server streaming
                    // So we keep it simple: we keep the connection open as long as possible,
                    // when new requests come while connection is open, they get queued to be processed when connection opens next time
                    this.persistentStreamReader().catch(function (err) {
                        console.error('[TranslationClient] Unhandled error in persistent stream reader:', err);
                    });
                    this.persistentStreamWriter = function (req) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // Since we can't send more than initial request in server streaming from browser (connect-web limitation),
                            // we have one connection per batch - when requests are pending,
                            // we send them all at once when connection starts
                            // If we have an existing connection, any new requests will be processed on the next connection
                            // when current connection finishes. This still provides efficient batching.
                            // For the persistent stream, we just accept the request is queued,
                            // and the server will get it when the stream is created with all queued requests.
                            // This is the best we can do with server streaming from browser.
                            // If there is no active connection or connection closed, automatically reconnect
                            if (!this.persistentStreamConnected || !this.persistentStream) {
                                console.log('[TranslationClient] Persistent stream not connected, restarting...');
                                this.startPersistentStream().catch(function (err) {
                                    console.error('[TranslationClient] Failed to restart persistent stream:', err);
                                });
                            }
                            return [2 /*return*/];
                        });
                    }); };
                    console.log('[TranslationClient] Persistent streaming connection started');
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Stop the persistent streaming connection
         * Cleans up all pending requests
         */
        TranslationClient.prototype.stopPersistentStream = function () {
            this.persistentStreamConnected = false;
            this.persistentStream = null;
            this.persistentStreamWriter = null;
            this.persistentStreamReader = null;
            // Reject all pending requests so they can fall back to individual connections
            Object.values(this.pool.pendingResolutions).forEach(function (pending) {
                pending.rejectList.forEach(function (reject) { return reject(new Error('Persistent stream stopped')); });
            });
            this.pool.pendingResolutions = {};
            console.log('[TranslationClient] Persistent streaming connection stopped');
        };
        /**
         * Check if persistent stream is connected and ready
         * @returns true if connected and ready
         */
        TranslationClient.prototype.isPersistentStreamConnected = function () {
            return this.persistentStreamConnected;
        };
        /**
         * Get information about the current sense
         * @returns Object containing sense ID and default settings
         */
        TranslationClient.prototype.getSenseInfo = function () {
            return {
                senseId: this.senseId,
                defaultFromLang: this.defaultFromLang,
            };
        };
        /**
         * Synchronous cache lookup (for immediate synchronous return in UI)
         * SDK automatically handles all caching internally
         * @param text Original text
         * @param toLang Target language
         * @param fromLang Source language (optional)
         * @param fingerprint Fingerprint (optional)
         * @returns Cache lookup result with found flag and translation
         */
        TranslationClient.prototype.lookupSync = function (text, toLang, fromLang, fingerprint) {
            var _a;
            fromLang || this.defaultFromLang;
            var actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
            return this.pool.lookup(text, actualFingerprint, toLang);
        };
        /**
         * Register callback for when translations are updated in the cache
         * This is used to trigger UI re-renders after background translation completes
         * @param callback Callback to invoke when translations are updated
         */
        TranslationClient.prototype.onTranslationUpdated = function (callback) {
            this.pool.setTranslationUpdatedCallback(callback);
        };
        /**
         * Register callback for compensation translation when language is switched
         * After switching to a new language, the callback will be invoked with all texts
         * that are missing translations for the new language, so the integrator can
         * queue them for translation to ensure all visible text gets translated
         * @param callback Callback to invoke with missing texts list and new language
         */
        TranslationClient.prototype.onCompensationTranslate = function (callback) {
            this.pool.setCompensationTranslateCallback(callback);
        };
        /**
         * Clear all cached translations for the current sense
         * Clears both in-memory cache and persistent storage
         */
        TranslationClient.prototype.clear = function () {
            this.pool.clear();
        };
        return TranslationClient;
    }());

    var translationClient = /*#__PURE__*/Object.freeze({
        __proto__: null,
        TranslationClient: TranslationClient,
        TranslationPool: TranslationPool,
        default: TranslationClient,
        extractTemplate: extractTemplate,
        mergeTemplate: mergeTemplate,
        version: version
    });

    /**
     * Browser-specific entry point that statically imports from @connectrpc/connect-web
     * This ensures bundlers don't include Node.js modules in browser builds
     */
    // MUST set this BEFORE importing translation-client!
    // Because translation-client checks this during module initialization
    if (typeof window !== 'undefined') {
        window.__LAKER_BROWSER_TRANSPORT = createConnectTransport$1;
    }
    // Explicitly ensure all exports are available on window.LakerTranslation
    // This guarantees that even if Rollup IIFE doesn't work, we still have the exports
    if (typeof window !== 'undefined') {
        if (!window.LakerTranslation) {
            window.LakerTranslation = {};
        }
        // Copy all exports to window
        Object.assign(window.LakerTranslation, translationClient);
        window.LakerTranslation.TranslationService = TranslationService;
        // Also add alias for backward compatibility
        if (!window.alaikisTranslation) {
            window.alaikisTranslation = window.LakerTranslation;
        }
    }

    exports.TranslationClient = TranslationClient;
    exports.TranslationPool = TranslationPool;
    exports.TranslationService = TranslationService;
    exports.extractTemplate = extractTemplate;
    exports.mergeTemplate = mergeTemplate;
    exports.version = version;

    return exports;

})({});
//# sourceMappingURL=translation-client.iife.js.map
