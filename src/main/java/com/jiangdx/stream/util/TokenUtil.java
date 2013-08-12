package com.jiangdx.stream.util;

import java.io.IOException;

/**
 * Key Util: 1> according file name|size ..., generate a key;
 * 			 2> the key should be unique.
 */
public class TokenUtil {
	private static Encode encode;
	static{
		try {
			encode = new Encode();
		} catch (Exception e) {
			System.out.println("初始化加密类Encode出错："+e);
		}
	}
	
	/**
	 * 生成Token， name的Hash值加密+_+size的值
	 * @param name
	 * @param size
	 * @return
	 * @throws Exception
	 */
	public static String generateToken(String name, String size) throws IOException {
		if (name == null || size == null)
			return "";
		try {
			return encode.encrypt(name.hashCode() + "") + "_" + size.trim();
		} catch (Exception e) {
			throw new IOException(e);
		}
	}
}
