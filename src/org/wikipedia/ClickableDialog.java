package org.wikipedia;

import android.app.Dialog;
import android.content.Context;
import android.view.MotionEvent;
import android.view.View;

public class ClickableDialog extends Dialog {

	private View.OnClickListener clickListener;
	
	public ClickableDialog(Context context) {
		super(context);
	}
	
	public void setOnClickListener(View.OnClickListener listener) {
		clickListener = listener;
	}
	
	@Override
	public boolean onTouchEvent(MotionEvent event) {
		if(!super.onTouchEvent(event)) {
			clickListener.onClick(null);
		}
		return true;
	}
}
